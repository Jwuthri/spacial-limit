'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ImageSrcAtom, DetectTypeAtom, BoundingBoxes2DAtom, BoundingBoxes3DAtom, BoundingBoxMasksAtom, PointsAtom } from '@/lib/atoms';

interface PredictionHistory {
  id: number;
  image_name: string;
  detect_type: string;
  target_prompt: string;
  created_at: string;
  processing_time?: number;
  result_count: number;
}

interface PredictionDetail {
  id: number;
  image_name: string;
  image_data: string;
  detect_type: string;
  target_prompt: string;
  label_prompt: string;
  segmentation_language: string;
  temperature: number;
  model_used: string;
  results: any[];
  created_at: string;
  processing_time?: number;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionDetail | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  
  const [, setImageSrc] = useAtom(ImageSrcAtom);
  const [, setDetectType] = useAtom(DetectTypeAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, filterType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const url = filterType 
        ? `${backendUrl}/history?detect_type=${encodeURIComponent(filterType)}`
        : `${backendUrl}/history`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
    setLoading(false);
  };

  const fetchPredictionDetail = async (id: number) => {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/prediction/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPrediction(data);
      }
    } catch (error) {
      console.error('Failed to fetch prediction detail:', error);
    }
  };

  const loadPrediction = (prediction: PredictionDetail) => {
    // Set the image
    setImageSrc(prediction.image_data);
    
    // Set the detection type
    setDetectType(prediction.detect_type as any);
    
    // Clear all results first
    setBoundingBoxes2D([]);
    setBoundingBoxes3D([]);
    setBoundingBoxMasks([]);
    setPoints([]);
    
    // Set the appropriate results
    if (prediction.detect_type === '2D bounding boxes') {
      setBoundingBoxes2D(prediction.results);
    } else if (prediction.detect_type === '3D bounding boxes') {
      setBoundingBoxes3D(prediction.results);
    } else if (prediction.detect_type === 'Segmentation masks') {
      setBoundingBoxMasks(prediction.results);
    } else if (prediction.detect_type === 'Points') {
      setPoints(prediction.results);
    }
    
    onClose();
  };

  const deletePrediction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prediction?')) return;
    
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/prediction/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchHistory(); // Refresh the list
        if (selectedPrediction?.id === id) {
          setSelectedPrediction(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete prediction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--background)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1200px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Prediction History</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px' }}
            >
              <option value="">All Types</option>
              <option value="2D bounding boxes">2D Bounding Boxes</option>
              <option value="3D bounding boxes">3D Bounding Boxes</option>
              <option value="Segmentation masks">Segmentation Masks</option>
              <option value="Points">Points</option>
            </select>
            <button onClick={onClose} style={{ fontSize: '18px', padding: '8px 12px' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* History List */}
          <div style={{
            width: '40%',
            borderRight: '1px solid var(--border-color)',
            overflow: 'auto',
            padding: '16px'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedPrediction?.id === item.id ? 'rgba(59, 104, 255, 0.1)' : 'transparent'
                    }}
                    onClick={() => fetchPredictionDetail(item.id)}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {item.image_name}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-color-secondary)' }}>
                      {item.detect_type} • {item.result_count} results
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-color-secondary)', marginTop: '4px' }}>
                      {new Date(item.created_at).toLocaleString()}
                      {item.processing_time && ` • ${item.processing_time.toFixed(2)}s`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail View */}
          <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
            {selectedPrediction ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>{selectedPrediction.image_name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => loadPrediction(selectedPrediction)}
                      style={{
                        background: '#3B68FF',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deletePrediction(selectedPrediction.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div style={{ marginBottom: '16px' }}>
                  <img
                    src={selectedPrediction.image_data}
                    alt={selectedPrediction.image_name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div><strong>Type:</strong> {selectedPrediction.detect_type}</div>
                  <div><strong>Model:</strong> {selectedPrediction.model_used}</div>
                  <div><strong>Prompt:</strong> {selectedPrediction.target_prompt}</div>
                  <div><strong>Temperature:</strong> {selectedPrediction.temperature}</div>
                  <div><strong>Results:</strong> {selectedPrediction.results.length} items</div>
                  <div><strong>Processing:</strong> {selectedPrediction.processing_time?.toFixed(2)}s</div>
                </div>

                {/* Results */}
                <div style={{ marginTop: '16px' }}>
                  <h4>Results:</h4>
                  <pre style={{
                    background: 'var(--input-color)',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(selectedPrediction.results, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-color-secondary)'
              }}>
                Select a prediction to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 