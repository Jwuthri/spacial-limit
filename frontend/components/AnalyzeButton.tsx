'use client';

import { useAtom } from 'jotai';
import { analyzeImageDirect } from '@/lib/gemini';
import {
  ImageSrcAtom,
  DetectTypeAtom,
  TargetPromptAtom,
  SegmentationLanguageAtom,
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
  const [segmentationLanguage] = useAtom(SegmentationLanguageAtom);
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
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={!imageSrc || isLoading}
      style={{
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#3B68FF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: !imageSrc || isLoading ? 'not-allowed' : 'pointer',
        opacity: !imageSrc || isLoading ? 0.5 : 1,
      }}
    >
      {isLoading ? 'Analyzing...' : `Analyze (${detectType})`}
    </button>
  );
} 