'use client';

import { useAtom } from 'jotai';
import { DetectTypeAtom } from '@/lib/atoms';
import { DetectTypes } from '@/lib/types';

const detectTypes: DetectTypes[] = [
  '2D bounding boxes',
  'Segmentation masks',
  'Points',
  '3D bounding boxes'
];

export default function DetectionTypeSelector() {
  const [detectType, setDetectType] = useAtom(DetectTypeAtom);

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
    </div>
  );
} 