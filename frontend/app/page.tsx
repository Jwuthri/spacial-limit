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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: 'var(--gradient-background)',
      overflow: 'hidden'
    }}>
      {/* Elegant Header */}
      <header className="glass-card" style={{ 
        margin: '20px',
        marginBottom: '10px',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 100
      }}>
        <div className="fade-in">
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            marginBottom: '8px',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Spatial Understanding
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '16px',
            fontWeight: '400',
            margin: 0
          }}>
            ✨ AI-powered computer vision analysis with advanced tools
          </p>
        </div>
        
        <div className="slide-up" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: geminiReady ? 'var(--success)' : 'var(--warning)',
              boxShadow: geminiReady ? '0 0 8px var(--success)' : '0 0 8px var(--warning)'
            }} />
            <span style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              {geminiReady ? 'AI Ready' : 'Setup Required'}
            </span>
          </div>
          
          <button
            onClick={() => setShowHistory(true)}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: '500'
            }}
          >
            <span style={{ fontSize: '16px' }}>📊</span>
            History
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        gap: '20px',
        margin: '0 20px 20px',
        overflow: 'hidden'
      }}>
        {/* Canvas Area */}
        <div className="glass-card scale-in" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative'
        }}>
          {imageSrc ? (
            <div style={{ flex: 1, position: 'relative' }}>
              <ImageCanvas />
              
              {/* Floating Analysis Status */}
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(20px)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 50
                }}>
                  <div 
                    className="spinner"
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid var(--border-primary)',
                      borderTop: '2px solid var(--primary)',
                      borderRadius: '50%'
                    }}
                  />
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    Analyzing with AI...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-primary)'}`,
                borderRadius: '16px',
                margin: '24px',
                background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Animated Background Pattern */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                opacity: dragActive ? 1 : 0.3,
                transition: 'opacity 0.3s ease'
              }} />
              
              <div className="fade-in" style={{ 
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--gradient-primary)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>
                  🖼️
                </div>
                
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text-primary)'
                }}>
                  Upload Your Image
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: 'var(--text-secondary)',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Drop an image here or click to browse
                  <br />
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Supports JPG, PNG, WebP • Max 10MB
                  </span>
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
                  className="btn-primary"
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Choose Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="glass-card slide-up" style={{ 
          width: '420px', 
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '24px 24px 0',
            borderBottom: '1px solid var(--border-primary)',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              AI Controls
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '16px'
            }}>
              Configure your computer vision analysis
            </p>
          </div>

          <div style={{ 
            padding: '0 24px 24px', 
            flex: 1, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              <GeminiSetup onReady={() => setGeminiReady(true)} />
            </div>
            
            {geminiReady && (
              <>
                <div className="fade-in" style={{ animationDelay: '0.2s' }}>
                  <DetectionTypeSelector />
                </div>
                <div className="fade-in" style={{ animationDelay: '0.3s' }}>
                  <PromptPanel />
                </div>
                <div className="fade-in" style={{ animationDelay: '0.4s' }}>
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