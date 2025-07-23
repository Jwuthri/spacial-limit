'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ResizePayload, useResizeDetector } from 'react-resize-detector';
import {
  ImageSrcAtom,
  DetectTypeAtom,
  BoundingBoxes2DAtom,
  BoundingBoxes3DAtom,
  BoundingBoxMasksAtom,
  PointsAtom,
  RevealOnHoverModeAtom
} from '@/lib/atoms';
import { segmentationColorsRgb } from '@/lib/atoms';

export default function ImageCanvas() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [detectType] = useAtom(DetectTypeAtom);
  const [boundingBoxes2D] = useAtom(BoundingBoxes2DAtom);
  const [boundingBoxes3D] = useAtom(BoundingBoxes3DAtom);
  const [boundingBoxMasks] = useAtom(BoundingBoxMasksAtom);
  const [points] = useAtom(PointsAtom);
  const [revealOnHover] = useAtom(RevealOnHoverModeAtom);

  const [containerDims, setContainerDims] = useState({ width: 0, height: 0 });
  const [activeMediaDimensions, setActiveMediaDimensions] = useState({ width: 1, height: 1 });
  const [hoverEntered, setHoverEntered] = useState(false);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const onResize = useCallback((el: ResizePayload) => {
    if (el.width && el.height) {
      setContainerDims({ width: el.width, height: el.height });
    }
  }, []);

  const { ref: containerRef } = useResizeDetector({ onResize });

  const boundingBoxContainer = useMemo(() => {
    const { width, height } = activeMediaDimensions;
    const aspectRatio = width / height;
    const containerAspectRatio = containerDims.width / containerDims.height;
    
    if (aspectRatio < containerAspectRatio) {
      return {
        height: containerDims.height,
        width: containerDims.height * aspectRatio,
      };
    } else {
      return {
        width: containerDims.width,
        height: containerDims.width / aspectRatio,
      };
    }
  }, [containerDims, activeMediaDimensions]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (revealOnHover) {
      setHoverEntered(true);
      setHoveredBoxFromEvent(e);
    }
  };

  const setHoveredBoxFromEvent = (e: React.PointerEvent) => {
    const boxes = document.querySelectorAll('.bbox');
    const dimensionsAndIndex = Array.from(boxes).map((box, i) => {
      const { top, left, width, height } = box.getBoundingClientRect();
      return { top, left, width, height, index: i };
    });
    
    // Sort smallest to largest
    const sorted = dimensionsAndIndex.sort(
      (a, b) => a.width * a.height - b.width * b.height,
    );
    
    // Find the smallest box that contains the mouse
    const { clientX, clientY } = e;
    const found = sorted.find(({ top, left, width, height }) => {
      return (
        clientX > left &&
        clientX < left + width &&
        clientY > top &&
        clientY < top + height
      );
    });
    
    if (found) {
      setHoveredBox(found.index);
    } else {
      setHoveredBox(null);
    }
  };

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%',
      flex: 1, 
      position: 'relative', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    }}>
      {imageSrc && (
        <img
          src={imageSrc}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
          alt="Uploaded image"
          onLoad={(e: any) => {
            setActiveMediaDimensions({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            });
          }}
        />
      )}
      
      {/* Overlay for detections */}
      <div
        className={hoverEntered ? 'hide-box' : ''}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: boundingBoxContainer.width,
          height: boundingBoxContainer.height,
          zIndex: 10,
          pointerEvents: imageSrc ? 'auto' : 'none'
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={(e) => {
          if (revealOnHover) {
            setHoverEntered(true);
            setHoveredBoxFromEvent(e);
          }
        }}
        onPointerLeave={(e) => {
          if (revealOnHover) {
            setHoverEntered(false);
            setHoveredBoxFromEvent(e);
          }
        }}
      >
        {/* 2D Bounding Boxes */}
        {detectType === '2D bounding boxes' &&
          boundingBoxes2D.map((box, i) => (
            <div
              key={i}
              className={`bbox ${i === hoveredBox ? 'reveal' : ''}`}
              style={{
                position: 'absolute',
                border: `3px solid ${i === hoveredBox ? 'var(--primary-light)' : 'var(--primary)'}`,
                borderRadius: '8px',
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
                boxShadow: i === hoveredBox ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  position: 'absolute',
                  left: '0px',
                  top: '0px',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '0 0 6px 0',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 10,
                  maxWidth: '90%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {box.label}
              </div>
            </div>
          ))}

        {/* Segmentation Masks */}
        {detectType === 'Segmentation masks' &&
          boundingBoxMasks.map((box, i) => (
            <div
              key={i}
              className={`bbox ${i === hoveredBox ? 'reveal' : ''}`}
              style={{
                position: 'absolute',
                border: `3px solid ${i === hoveredBox ? 'var(--secondary)' : 'var(--primary)'}`,
                borderRadius: '12px',
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
                boxShadow: i === hoveredBox ? '0 0 20px rgba(6, 182, 212, 0.4)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
              }}
            >
              {box.imageData && <BoxMask box={box} index={i} />}
              <div style={{ width: '100%', top: 0, height: 0, position: 'absolute' }}>
                <div
                  style={{
                    background: 'var(--gradient-secondary)',
                    color: 'white',
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '0 0 6px 0',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-md)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    maxWidth: '90%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {box.label}
                </div>
              </div>
            </div>
          ))}

        {/* Points */}
        {detectType === 'Points' &&
          points.map((point, i) => (
            <div
              key={i}
              className={`bbox ${i === hoveredBox ? 'reveal' : ''}`}
              style={{
                position: 'absolute',
                left: `${point.point.x * 100}%`,
                top: `${point.point.y * 100}%`,
                width: '24px',
                height: '24px',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Point Label */}
              <div
                style={{
                  position: 'absolute',
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 10px',
                  bottom: '28px',
                  borderRadius: '8px',
                  transform: 'translateX(-50%)',
                  left: '50%',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {point.label}
              </div>
              
              {/* Point Marker */}
              <div
                style={{
                  position: 'absolute',
                  width: '20px',
                  height: '20px',
                  background: 'var(--gradient-accent)',
                  borderRadius: '50%',
                  border: '3px solid white',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: i === hoveredBox ? 
                    '0 0 20px rgba(245, 158, 11, 0.6), var(--shadow-lg)' : 
                    'var(--shadow-md)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              
              {/* Pulse animation for active point */}
              {i === hoveredBox && (
                <div
                  style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    border: '2px solid var(--accent)',
                    borderRadius: '50%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 2s infinite'
                  }}
                />
              )}
            </div>
          ))}

        {/* 3D Bounding Boxes */}
        {detectType === '3D bounding boxes' &&
          boundingBoxes3D.map((box, i) => (
            <div key={i} style={{ position: 'absolute' }}>
              {/* Enhanced 3D box representation */}
              <div
                className={`bbox ${i === hoveredBox ? 'reveal' : ''}`}
                style={{
                  position: 'absolute',
                  border: `3px solid ${i === hoveredBox ? 'var(--primary-light)' : 'var(--primary)'}`,
                  borderRadius: '12px',
                  width: '120px',
                  height: '120px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
                  backdropFilter: 'blur(5px)',
                  boxShadow: i === hoveredBox ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* 3D Effect Lines */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    right: '8px',
                    bottom: '8px',
                    border: `2px solid ${i === hoveredBox ? 'var(--primary-light)' : 'var(--primary)'}`,
                    borderRadius: '8px',
                    opacity: 0.6
                  }}
                />
                
                <div
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '8px 12px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {box.label}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function BoxMask({ box, index }: { box: any; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rgb = segmentationColorsRgb[index % segmentationColorsRgb.length];

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = box.imageData;
        image.onload = () => {
          canvasRef.current!.width = image.width;
          canvasRef.current!.height = image.height;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const data = pixels.data;
          for (let i = 0; i < data.length; i += 4) {
            // alpha from mask
            data[i + 3] = data[i];
            // color from palette
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
          }
          ctx.putImageData(pixels, 0, 0);
        };
      }
    }
  }, [canvasRef, box.imageData, rgb]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.5,
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease'
      }}
    />
  );
} 