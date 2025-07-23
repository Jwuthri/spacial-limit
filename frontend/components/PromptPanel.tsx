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
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Prompt Configuration
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          lineHeight: '1.4'
        }}>
          Configure what the AI should detect and how to label the results
        </p>
        
        {/* Main Detection Prompt */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>🎯</span>
            {is2d ? 'What to detect' : 'Detection target'}
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder={is2d ? 
                "e.g., people, cars, animals, furniture..." : 
                "Describe what you want to detect in the image..."
              }
              rows={3}
              value={targetPrompt}
              onChange={(e) => setTargetPrompt(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                resize: 'none',
                fontSize: '14px',
                lineHeight: '1.5',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s ease'
              }}
            />
            {targetPrompt && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                background: 'var(--bg-card)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {targetPrompt.length} chars
              </div>
            )}
          </div>
        </div>

        {/* Label Prompt (for 2D only) */}
        {is2d && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              <span style={{ fontSize: '16px', marginRight: '8px' }}>🏷️</span>
              Label format (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., person-1, car-red, dog-small..."
              value={labelPrompt}
              onChange={(e) => setLabelPrompt(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                resize: 'none',
                fontSize: '14px',
                lineHeight: '1.5',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        )}

        {/* Language Setting (for Segmentation) */}
        {detectType === 'Segmentation masks' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              <span style={{ fontSize: '16px', marginRight: '8px' }}>🌍</span>
              Output language
            </label>
            <input
              type="text"
              placeholder="e.g., English, Deutsch, Français, Español, 中文"
              value={segmentationLanguage}
              onChange={(e) => setSegmentationLanguage(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                fontSize: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        )}

        {/* Temperature Control */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>🌡️</span>
            AI Creativity Level
          </label>
          
          <div style={{
            padding: '20px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              marginBottom: '12px'
            }}>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                fontWeight: '500'
              }}>
                Conservative
              </span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                disabled={isLoading}
                style={{ 
                  flex: 1,
                  height: '6px'
                }}
              />
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                fontWeight: '500'
              }}>
                Creative
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                {temperature < 0.5 ? 
                  'More precise, consistent results' : 
                  temperature > 1.5 ? 
                  'More creative, varied results' : 
                  'Balanced precision and creativity'
                }
              </div>
              <div style={{
                background: 'var(--bg-card)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--primary)',
                minWidth: '50px',
                textAlign: 'center'
              }}>
                {temperature.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
          borderRadius: '12px',
          border: '1px solid var(--border-secondary)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--primary)30, transparent)',
            borderRadius: '0 12px 0 40px'
          }} />
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '8px' 
            }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                Pro Tips
              </span>
            </div>
            <ul style={{ 
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li>Be specific: "red cars" instead of "vehicles"</li>
              <li>Use descriptive terms: "people walking" vs "people"</li>
              <li>Lower temperature for consistent detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 