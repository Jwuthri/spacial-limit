'use client';

import { useAtom } from 'jotai';
import {
  DetectTypeAtom,
  TargetPromptAtom,
  LabelPromptAtom,
  SegmentationLanguageAtom,
  TemperatureAtom,
  IsLoadingAtom
} from '@/lib/atoms';

interface PromptPanelProps {
  onAnalyze?: () => void;
}

export default function PromptPanel({ onAnalyze }: PromptPanelProps) {
  const [detectType] = useAtom(DetectTypeAtom);
  const [targetPrompt, setTargetPrompt] = useAtom(TargetPromptAtom);
  const [labelPrompt, setLabelPrompt] = useAtom(LabelPromptAtom);
  const [segmentationLanguage, setSegmentationLanguage] = useAtom(SegmentationLanguageAtom);
  const [temperature, setTemperature] = useAtom(TemperatureAtom);
  const [isLoading] = useAtom(IsLoadingAtom);

  const is2d = detectType === '2D bounding boxes';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
          Prompt Configuration
        </h3>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
            {is2d ? 'Detect' : 'What to detect:'}
          </label>
          <textarea
            placeholder="What kind of things do you want to detect?"
            rows={2}
            value={targetPrompt}
            onChange={(e) => setTargetPrompt(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              resize: 'none',
              fontSize: '14px'
            }}
          />
        </div>

        {is2d && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
              Label each one with: (optional)
            </label>
            <textarea
              rows={2}
              placeholder="How do you want to label the things?"
              value={labelPrompt}
              onChange={(e) => setLabelPrompt(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                resize: 'none',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {detectType === 'Segmentation masks' && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>
              Output labels in language: (e.g. Deutsch, Français, Español, 中文)
            </label>
            <textarea
              rows={1}
              placeholder="e.g., Deutsch, Français, Español"
              value={segmentationLanguage}
              onChange={(e) => setSegmentationLanguage(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                resize: 'none',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px'
          }}>
            Temperature:
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <span style={{ minWidth: '40px', textAlign: 'right' }}>
              {temperature.toFixed(2)}
            </span>
          </label>
        </div>
      </div>

      {onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          style={{
            background: isLoading ? '#ccc' : '#3B68FF',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              Analyzing...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      )}

      {onAnalyze && (
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </div>
  );
} 