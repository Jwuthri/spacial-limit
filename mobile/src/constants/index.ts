import { DetectionType } from '@/types';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Change this to your backend URL
  ENDPOINTS: {
    ANALYZE: '/analyze',
    HISTORY: '/history',
    PREDICTION: '/prediction',
  },
  TIMEOUT: 30000, // 30 seconds
};

// Detection types
export const DETECTION_TYPES: DetectionType[] = [
  '2D bounding boxes',
  '3D bounding boxes',
  'Segmentation masks',
  'Points',
];

// Default values
export const DEFAULTS = {
  TEMPERATURE: 0.4,
  TARGET_PROMPT: 'items',
  LABEL_PROMPT: '',
  SEGMENTATION_LANGUAGE: 'English',
  DETECTION_TYPE: '2D bounding boxes' as DetectionType,
};

// Supported languages for segmentation
export const SEGMENTATION_LANGUAGES = [
  'English',
  'Spanish', 
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Portuguese',
  'Italian',
  'Russian',
];

// Image picker options
export const IMAGE_PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  includeBase64: true,
  maxHeight: 2000,
  maxWidth: 2000,
  quality: 0.8,
};

// Colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  shadow: '#000000',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}; 