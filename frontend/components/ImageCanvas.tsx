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
    <div ref={containerRef} style={{ width: '100%', flex: 1, position: 'relative' }}>
      {imageSrc && (
        <img
          src={imageSrc}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
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
                border: '2px solid #3B68FF',
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}
            >
              <div
                style={{
                  background: '#3B68FF',
                  color: 'white',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: '14px',
                  padding: '2px 6px',
                  whiteSpace: 'nowrap'
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
                border: '2px solid #3B68FF',
                top: `${box.y * 100}%`,
                left: `${box.x * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}
            >
              {box.imageData && <BoxMask box={box} index={i} />}
              <div style={{ width: '100%', top: 0, height: 0, position: 'absolute' }}>
                <div
                  style={{
                    background: '#3B68FF',
                    color: 'white',
                    position: 'absolute',
                    left: '-2px',
                    bottom: 0,
                    fontSize: '14px',
                    padding: '2px 6px',
                    whiteSpace: 'nowrap'
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
              style={{
                position: 'absolute',
                left: `${point.point.x * 100}%`,
                top: `${point.point.y * 100}%`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  background: '#3B68FF',
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px 6px',
                  bottom: '16px',
                  borderRadius: '2px',
                  transform: 'translateX(-50%)',
                  left: '50%',
                  whiteSpace: 'nowrap'
                }}
              >
                {point.label}
              </div>
              <div
                style={{
                  position: 'absolute',
                  width: '16px',
                  height: '16px',
                  background: '#3B68FF',
                  borderRadius: '50%',
                  border: '2px solid white',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          ))}

        {/* 3D Bounding Boxes */}
        {detectType === '3D bounding boxes' &&
          boundingBoxes3D.map((box, i) => (
            <div key={i} style={{ position: 'absolute' }}>
              {/* Simple 3D box representation - could be enhanced */}
              <div
                style={{
                  position: 'absolute',
                  border: '2px solid #3B68FF',
                  width: '100px',
                  height: '100px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  style={{
                    background: '#3B68FF',
                    color: 'white',
                    fontSize: '12px',
                    padding: '2px 6px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    whiteSpace: 'nowrap'
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
        pointerEvents: 'none'
      }}
    />
  );
} 