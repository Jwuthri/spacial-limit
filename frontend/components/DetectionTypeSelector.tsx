'use client';

import { useAtom } from 'jotai';
import { DetectTypeAtom, RevealOnHoverModeAtom } from '@/lib/atoms';
import { DetectTypes } from '@/lib/types';

const detectTypes: DetectTypes[] = [
  '2D bounding boxes',
  'Segmentation masks',
  'Points',
  '3D bounding boxes'
];

export default function DetectionTypeSelector() {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);
  const [revealOnHover, setRevealOnHover] = useAtom(RevealOnHoverModeAtom);

  return (
    <div>
      <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
        Detection Type
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {detectTypes.map((type) => (
          <label
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              background: detectType === type ? 'rgba(59, 104, 255, 0.1)' : 'transparent',
              border: `1px solid ${detectType === type ? '#3B68FF' : 'var(--border-color)'}`,
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="radio"
              name="detectType"
              value={type}
              checked={detectType === type}
              onChange={(e) => setDetectType(e.target.value as DetectTypes)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: '14px' }}>{type}</span>
          </label>
        ))}
      </div>
      
      {/* Reveal on Hover Toggle */}
      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <input
            type="checkbox"
            checked={revealOnHover}
            onChange={(e) => setRevealOnHover(e.target.checked)}
            style={{ margin: 0 }}
          />
          <span>🎯 Reveal on hover</span>
        </label>
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--text-color-secondary)', 
          margin: '4px 0 0 0',
          lineHeight: '1.3'
        }}>
          Highlight individual objects when hovering over them
        </p>
      </div>
    </div>
  );
} 