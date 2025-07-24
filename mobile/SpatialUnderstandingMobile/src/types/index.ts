// Detection types that match the backend
export type DetectionType = 
  | '2D bounding boxes'
  | '3D bounding boxes' 
  | 'Segmentation masks'
  | 'Points';

// Analysis request parameters
export interface AnalysisRequest {
  file: string; // base64 encoded image
  detect_type: DetectionType;
  target_prompt: string;
  label_prompt?: string;
  segmentation_language: string;
  temperature: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error: string | null;
  prediction_id?: number;
}

// Detection result types
export interface BoundingBox2D {
  label: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BoundingBox3D {
  label: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z1?: number;
  z2?: number;
}

export interface Point {
  label: string;
  confidence: number;
  x: number;
  y: number;
}

export interface SegmentationMask {
  label: string;
  confidence: number;
  mask: string; // base64 encoded mask
}

// History/Prediction types
export interface Prediction {
  id: number;
  image_data: string;
  detect_type: DetectionType;
  target_prompt: string;
  label_prompt?: string;
  segmentation_language: string;
  temperature: number;
  results: any[];
  processing_time: number;
  created_at: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  History: undefined;
  Analysis: {
    imageUri: string;
  };
};

// App state types
export interface AppState {
  isLoading: boolean;
  selectedDetectionType: DetectionType;
  temperature: number;
  targetPrompt: string;
  labelPrompt: string;
  segmentationLanguage: string;
} 