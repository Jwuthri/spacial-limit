'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  ImageSrcAtom, 
  DetectTypeAtom, 
  IsLoadingAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  TargetPromptAtom,
  LabelPromptAtom,
  SegmentationLanguageAtom,
  TemperatureAtom
} from '@/lib/atoms';
import { DetectTypes } from '@/lib/types';
import ImageCanvas from '@/components/ImageCanvas';
import PromptPanel from '@/components/PromptPanel';
import DetectionTypeSelector from '@/components/DetectionTypeSelector';
import HistoryPanel from '@/components/HistoryPanel';
import GeminiSetup from '@/components/GeminiSetup';
import AnalyzeButton from '@/components/AnalyzeButton';

export default function Home() {
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);
  const [targetPrompt] = useAtom(TargetPromptAtom);
  const [labelPrompt] = useAtom(LabelPromptAtom);
  const [segmentationLanguage] = useAtom(SegmentationLanguageAtom);
  const [temperature] = useAtom(TemperatureAtom);
  
  const [dragActive, setDragActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [geminiReady, setGeminiReady] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        // Reset results
        setBoundingBoxes2D([]);
        setBoundingBoxes3D([]);
        setBoundingBoxMasks([]);
        setPoints([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--background)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            Spatial Understanding
          </h1>
          <p style={{ color: 'var(--text-color-secondary)', margin: '8px 0 0 0' }}>
            AI-powered computer vision analysis with tools & database
          </p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 History
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden' 
      }}>
        {/* Image Canvas */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0
        }}>
          {imageSrc ? (
            <ImageCanvas />
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${dragActive ? '#3B68FF' : 'var(--border-color)'}`,
                margin: '20px',
                borderRadius: '8px',
                background: dragActive ? 'rgba(59, 104, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', marginBottom: '16px' }}>
                  Drop an image here or click to upload
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <button
                  onClick={() => document.getElementById('file-input')?.click()}
                  style={{
                    background: '#3B68FF',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div style={{ 
          width: '400px', 
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)'
        }}>
          <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
            <GeminiSetup onReady={() => setGeminiReady(true)} />
            {geminiReady && (
              <>
                <div style={{ marginTop: '20px' }}>
                  <DetectionTypeSelector />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <PromptPanel />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <AnalyzeButton />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
} 