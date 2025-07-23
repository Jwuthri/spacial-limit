'use client';

import { useAtom } from 'jotai';
import { DetectTypeAtom, RevealOnHoverModeAtom } from '@/lib/atoms';
import { DetectTypes } from '@/lib/types';

const detectTypes: { 
  type: DetectTypes; 
  icon: string; 
  description: string;
  color: string;
}[] = [
  {
    type: '2D bounding boxes',
    icon: '📦',
    description: 'Detect and locate objects with rectangular boundaries',
    color: 'var(--primary)'
  },
  {
    type: 'Segmentation masks',
    icon: '🎨',
    description: 'Precise pixel-level object segmentation',
    color: 'var(--secondary)'
  },
  {
    type: 'Points',
    icon: '📍',
    description: 'Identify specific points and landmarks',
    color: 'var(--accent)'
  },
  {
    type: '3D bounding boxes',
    icon: '🎲',
    description: 'Three-dimensional object detection (experimental)',
    color: 'var(--primary-light)'
  }
];

export default function DetectionTypeSelector() {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [revealOnHover, setRevealOnHover] = useAtom(RevealOnHoverModeAtom);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Detection Type
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          lineHeight: '1.4'
        }}>
          Choose the type of computer vision analysis
        </p>
        
        <div style={{ 
          display: 'grid', 
          gap: '16px'
        }}>
          {detectTypes.map((item) => {
            const isSelected = detectType === item.type;
            return (
              <label
                key={item.type}
                style={{
                  display: 'block',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <input
                  type="radio"
                  name="detectType"
                  value={item.type}
                  checked={isSelected}
                  onChange={(e) => setDetectType(e.target.value as DetectTypes)}
                  style={{ 
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                />
                
                <div style={{
                  padding: '16px 20px',
                  background: isSelected ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  border: `2px solid ${isSelected ? item.color : 'var(--border-primary)'}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                }}>
                  {/* Selection indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      right: '0px',
                      height: '3px',
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}CC)`,
                      borderRadius: '12px 12px 0 0'
                    }} />
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '16px'
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: isSelected ? item.color : 'var(--bg-card)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: isSelected ? item.color : 'var(--text-primary)',
                        marginBottom: '4px',
                        transition: 'color 0.3s ease'
                      }}>
                        {item.type}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.3'
                      }}>
                        {item.description}
                      </div>
                    </div>
                    
                    {/* Radio indicator */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? item.color : 'var(--border-primary)'}`,
                      background: isSelected ? item.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                    }}>
                      {isSelected && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'white'
                        }} />
                      )}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      
      {/* Reveal on Hover Feature */}
      <div style={{
        padding: '20px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, var(--primary)20, transparent)',
          borderRadius: '0 16px 0 60px'
        }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: revealOnHover ? 'var(--gradient-primary)' : 'var(--bg-card)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}>
              🎯
            </div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Interactive Mode
            </h4>
          </div>
          
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            <input
              type="checkbox"
              checked={revealOnHover}
              onChange={(e) => setRevealOnHover(e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                marginTop: '2px',
                accentColor: 'var(--primary)'
              }}
            />
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                Reveal on hover
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                Highlight individual objects when hovering over them for better exploration
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
} 