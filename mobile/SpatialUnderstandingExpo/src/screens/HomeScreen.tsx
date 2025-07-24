import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

// Components
import DetectionTypeSelector from '@/components/DetectionTypeSelector';
import PromptPanel from '@/components/PromptPanel';
import AnalysisResults from '@/components/AnalysisResults';

// Services
import { apiService } from '@/services/api';

// Utils
import { imageToBase64, resizeImage } from '@/utils/image';

// Constants
import { COLORS, SPACING, FONT_SIZES, IMAGE_PICKER_OPTIONS, DEFAULTS } from '@/constants';

// Types
import { DetectionType, AnalysisRequest, ApiResponse } from '@/types';

const HomeScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionType, setDetectionType] = useState<DetectionType>(DEFAULTS.DETECTION_TYPE);
  const [targetPrompt, setTargetPrompt] = useState(DEFAULTS.TARGET_PROMPT);
  const [labelPrompt, setLabelPrompt] = useState(DEFAULTS.LABEL_PROMPT);
  const [segmentationLanguage, setSegmentationLanguage] = useState(DEFAULTS.SEGMENTATION_LANGUAGE);
  const [temperature, setTemperature] = useState(DEFAULTS.TEMPERATURE);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [overlayImageUri, setOverlayImageUri] = useState<string | null>(null);
  
  // Temporary: disable resizing to fix coordinate alignment
  const ENABLE_MOBILE_RESIZE = false;
  
  // Use new backend overlay endpoint instead of frontend rendering
  const USE_BACKEND_OVERLAY = true;

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (ENABLE_MOBILE_RESIZE) {
          // Resize the image and display the resized version
          const resizedUri = await resizeImage(result.assets[0].uri);
          setSelectedImage(resizedUri);
        } else {
          // Use original image (no resizing)
          setSelectedImage(result.assets[0].uri);
        }
        setAnalysisResults(null); // Clear previous results
        setOverlayImageUri(null); // Clear previous overlay
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Image Picker Error',
        text2: error.message,
      });
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsLoading(true);
    setAnalysisResults(null);

    try {
      // Use selected image (resized or original based on ENABLE_MOBILE_RESIZE flag)
      const request: AnalysisRequest = {
        file: selectedImage, // Original image or resized based on flag
        detect_type: detectionType,
        target_prompt: targetPrompt,
        label_prompt: labelPrompt,
        segmentation_language: segmentationLanguage,
        temperature: temperature,
      };

      if (USE_BACKEND_OVERLAY) {
        // Use new endpoint that returns image with overlays drawn by backend
        const response = await apiService.analyzeImageWithOverlay(request);
        
        if (response.success) {
          setAnalysisResults(response.data);
          setOverlayImageUri(response.overlay_image || null);
          Toast.show({
            type: 'success',
            text1: 'Analysis Complete',
            text2: 'Image analyzed with backend overlay!',
          });
        } else {
          throw new Error(response.error || 'Analysis failed');
        }
      } else {
        // Use original endpoint
        const response: ApiResponse = await apiService.analyzeImage(request);

        if (response.success) {
          setAnalysisResults(response.data);
          setOverlayImageUri(null);
          Toast.show({
            type: 'success',
            text1: 'Analysis Complete',
            text2: 'Image analyzed successfully!',
          });
        } else {
          throw new Error(response.error || 'Analysis failed');
        }
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('Error', `Analysis failed: ${error.message}`);
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Image</Text>
        <TouchableOpacity style={styles.imageUploadArea} onPress={handleImagePicker}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Text style={styles.uploadText}>Tap to select image</Text>
              <Text style={styles.uploadSubtext}>JPG, PNG, GIF, WebP</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Detection Type Selection */}
      <View style={styles.section}>
        <DetectionTypeSelector
          selectedType={detectionType}
          onTypeChange={setDetectionType}
        />
      </View>

      {/* Configuration Panel */}
      <View style={styles.section}>
        <PromptPanel
          targetPrompt={targetPrompt}
          labelPrompt={labelPrompt}
          segmentationLanguage={segmentationLanguage}
          temperature={temperature}
          onTargetPromptChange={setTargetPrompt}
          onLabelPromptChange={setLabelPrompt}
          onSegmentationLanguageChange={setSegmentationLanguage}
          onTemperatureChange={setTemperature}
        />
      </View>

      {/* Analyze Button */}
      <TouchableOpacity
        style={[styles.analyzeButton, (!selectedImage || isLoading) && styles.disabledButton]}
        onPress={handleAnalyzeImage}
        disabled={!selectedImage || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.surface} size="small" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Image</Text>
        )}
      </TouchableOpacity>

      {/* Analysis Results */}
      {analysisResults && (
        <View style={styles.section}>
          <AnalysisResults
            results={analysisResults}
            detectionType={detectionType}
            imageUri={USE_BACKEND_OVERLAY && overlayImageUri ? overlayImageUri : selectedImage}
            useBackendOverlay={USE_BACKEND_OVERLAY}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    backgroundColor: COLORS.surface,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: SPACING.sm,
    resizeMode: 'contain',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  uploadSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  analyzeButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 