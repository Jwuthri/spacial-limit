'use client';

import { useAtom } from 'jotai';
import { analyzeImageDirect } from '@/lib/gemini';
import { saveAnalysisToDatabase } from '@/lib/utils';
import {
  ImageSrcAtom,
  DetectTypeAtom,
  TargetPromptAtom,
  LabelPromptAtom,
  SegmentationLanguageAtom,
  TemperatureAtom,
  IsLoadingAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  PointsAtom
} from '@/lib/atoms';

export default function AnalyzeButton() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [targetPrompt] = useAtom(TargetPromptAtom);
  const [labelPrompt] = useAtom(LabelPromptAtom);
  const [segmentationLanguage] = useAtom(SegmentationLanguageAtom);
  const [temperature] = useAtom(TemperatureAtom);
  const [isLoading, setIsLoading] = useAtom(IsLoadingAtom);
  const [, setBoundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [, setBoundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [, setBoundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [, setPoints] = useAtom(PointsAtom);

  const handleAnalyze = async () => {
    if (!imageSrc) {
      alert('Please upload an image first');
      return;
    }

    setIsLoading(true);
    
    // Clear previous results
    setBoundingBoxes2D([]);
    setBoundingBoxes3D([]);
    setBoundingBoxMasks([]);
    setPoints([]);

    try {
      const result = await analyzeImageDirect(
        imageSrc,
        detectType,
        targetPrompt,
        segmentationLanguage
      );

      // Set results based on detection type
      if (detectType === '2D bounding boxes') {
        setBoundingBoxes2D(result);
      } else if (detectType === 'Segmentation masks') {
        setBoundingBoxMasks(result);
      } else if (detectType === 'Points') {
        setPoints(result);
      } else if (detectType === '3D bounding boxes') {
        setBoundingBoxes3D(result);
      }

      console.log('Analysis result:', result);

      // Save to database in the background
      try {
        const saveResult = await saveAnalysisToDatabase(
          imageSrc,
          detectType,
          targetPrompt,
          labelPrompt,
          segmentationLanguage,
          temperature,
          result
        );
        console.log('Saved to database:', saveResult);
      } catch (saveError) {
        console.warn('Failed to save to database:', saveError);
        // Don't alert here since the main analysis succeeded
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !imageSrc || isLoading;

  return (
    <div>
      {/* Main Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isDisabled}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          position: 'relative',
          overflow: 'hidden',
          background: isDisabled ? 
            'var(--bg-card)' : 
            isLoading ? 
            'var(--gradient-secondary)' : 
            'var(--gradient-primary)',
          color: isDisabled ? 'var(--text-muted)' : 'white',
          border: isDisabled ? '1px solid var(--border-primary)' : 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isLoading ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        {/* Background animation for loading */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 1.5s infinite'
          }} />
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          {isLoading ? (
            <>
              <div 
                className="spinner"
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%'
                }}
              />
              <span>Analyzing with AI...</span>
            </>
          ) : !imageSrc ? (
            <>
              <span style={{ fontSize: '18px' }}>📤</span>
              <span>Upload an image first</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '18px' }}>🚀</span>
              <span>Analyze with {detectType}</span>
            </>
          )}
        </div>
      </button>

      {/* Status Information */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-secondary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: imageSrc ? 'var(--success)' : 'var(--warning)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            {imageSrc ? '✓' : '!'}
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Analysis Setup
          </span>
        </div>
        
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Detection:</strong> {detectType}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Target:</strong> {targetPrompt || 'Not specified'}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Temperature:</strong> {temperature.toFixed(2)}
          </div>
          {detectType === '2D bounding boxes' && labelPrompt && (
            <div style={{ marginBottom: '4px' }}>
              <strong>Labels:</strong> {labelPrompt}
            </div>
          )}
          {detectType === 'Segmentation masks' && (
            <div>
              <strong>Language:</strong> {segmentationLanguage}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      {!imageSrc && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          borderRadius: '12px',
          border: '1px solid var(--primary)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30px',
            height: '30px',
            background: 'linear-gradient(135deg, var(--primary)40, transparent)',
            borderRadius: '0 12px 0 30px'
          }} />
          
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>💫</span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--primary)'
              }}>
                Ready to analyze!
              </span>
            </div>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Upload an image to start AI-powered computer vision analysis. 
              Your settings are configured and ready to go.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 