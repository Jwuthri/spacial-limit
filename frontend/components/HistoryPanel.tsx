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
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card scale-in" style={{
        width: '95%',
        maxWidth: '1400px',
        height: '85%',
        maxHeight: '900px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elegant Header */}
        <div style={{
          padding: '32px',
          borderBottom: '1px solid var(--border-primary)',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
          position: 'relative'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, var(--primary)20, transparent)',
            borderRadius: '0 16px 0 100px'
          }} />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '28px',
                fontWeight: '700',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                Analysis History
              </h2>
              <p style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                Browse and restore your previous computer vision analyses
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '180px'
                }}
              >
                <option value="">All Detection Types</option>
                <option value="2D bounding boxes">📦 2D Bounding Boxes</option>
                <option value="3D bounding boxes">🎲 3D Bounding Boxes</option>
                <option value="Segmentation masks">🎨 Segmentation Masks</option>
                <option value="Points">📍 Points</option>
              </select>
              
              <button 
                onClick={onClose} 
                className="btn-ghost"
                style={{ 
                  fontSize: '20px', 
                  padding: '12px',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* History List */}
          <div style={{
            width: '45%',
            borderRight: '1px solid var(--border-primary)',
            overflow: 'auto',
            padding: '24px',
            background: 'var(--bg-secondary)'
          }}>
            {loading ? (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div 
                  className="spinner"
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid var(--border-primary)',
                    borderTop: '3px solid var(--primary)',
                    borderRadius: '50%'
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                flexDirection: 'column',
                gap: '16px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '48px' }}>📂</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    No analysis history yet
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Run your first analysis to see results here
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((item) => {
                  const isSelected = selectedPrediction?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className="fade-in"
                      style={{
                        padding: '20px',
                        background: isSelected ? 'var(--bg-hover)' : 'var(--bg-card)',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-primary)'}`,
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => fetchPredictionDetail(item.id)}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'var(--gradient-primary)'
                        }} />
                      )}
                      
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '8px',
                          fontSize: '16px',
                          color: 'var(--text-primary)'
                        }}>
                          {item.image_name}
                        </div>
                        
                        <div style={{ 
                          fontSize: '14px', 
                          color: 'var(--text-secondary)',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>
                            {item.detect_type === '2D bounding boxes' ? '📦' :
                             item.detect_type === '3D bounding boxes' ? '🎲' :
                             item.detect_type === 'Segmentation masks' ? '🎨' : '📍'}
                          </span>
                          <span>{item.detect_type}</span>
                          <span>•</span>
                          <span style={{ 
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {item.result_count} results
                          </span>
                        </div>
                        
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                          <span>🕒 {new Date(item.created_at).toLocaleTimeString()}</span>
                          {item.processing_time && (
                            <span>⚡ {item.processing_time.toFixed(2)}s</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail View */}
          <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
            {selectedPrediction ? (
              <div className="fade-in">
                {/* Header with actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '24px' 
                }}>
                  <div>
                    <h3 style={{ 
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: '8px'
                    }}>
                      {selectedPrediction.image_name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>📅 {new Date(selectedPrediction.created_at).toLocaleString()}</span>
                      {selectedPrediction.processing_time && (
                        <span>⚡ {selectedPrediction.processing_time.toFixed(2)}s processing</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => loadPrediction(selectedPrediction)}
                      className="btn-primary"
                      style={{
                        padding: '12px 20px',
                        fontWeight: '600'
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>🔄</span>
                      Load Analysis
                    </button>
                    <button
                      onClick={() => deletePrediction(selectedPrediction.id)}
                      className="btn-secondary"
                      style={{
                        padding: '12px 20px',
                        color: 'var(--error)',
                        borderColor: 'var(--error)'
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>🗑️</span>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Image Preview */}
                <div style={{ 
                  marginBottom: '24px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-primary)'
                }}>
                  <img
                    src={selectedPrediction.image_data}
                    alt={selectedPrediction.image_name}
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      background: 'var(--bg-secondary)'
                    }}
                  />
                </div>

                {/* Analysis Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Detection Type
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedPrediction.detect_type}
                    </div>
                  </div>
                  
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      AI Model
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedPrediction.model_used}
                    </div>
                  </div>
                  
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Results Found
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>
                      {selectedPrediction.results.length} items
                    </div>
                  </div>
                  
                  <div className="glass-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Temperature
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {selectedPrediction.temperature.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Prompts */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '16px'
                  }}>
                    Prompts Used
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="glass-card" style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        🎯 Target Prompt
                      </div>
                      <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {selectedPrediction.target_prompt}
                      </div>
                    </div>
                    
                    {selectedPrediction.label_prompt && (
                      <div className="glass-card" style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          🏷️ Label Prompt
                        </div>
                        <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {selectedPrediction.label_prompt}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Preview */}
                <div>
                  <h4 style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '16px'
                  }}>
                    Detection Results
                  </h4>
                  
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <pre style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      lineHeight: '1.4'
                    }}>
                      {JSON.stringify(selectedPrediction.results, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: '20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '64px' }}>🔍</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                    Select an analysis
                  </div>
                  <div style={{ fontSize: '16px' }}>
                    Choose an item from the history to view details
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 