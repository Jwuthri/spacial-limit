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
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
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

  const handleImagePicker = () => {
    launchImageLibrary(IMAGE_PICKER_OPTIONS, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          setAnalysisResults(null); // Clear previous results
        }
      }
    });
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsLoading(true);
    setAnalysisResults(null);

    try {
      // Resize image for upload
      const resizedUri = await resizeImage(selectedImage);
      
      // Convert to base64
      const base64Image = await imageToBase64(resizedUri);

      const request: AnalysisRequest = {
        file: base64Image,
        detect_type: detectionType,
        target_prompt: targetPrompt,
        label_prompt: labelPrompt,
        segmentation_language: segmentationLanguage,
        temperature: temperature,
      };

      const response: ApiResponse = await apiService.analyzeImage(request);

      if (response.success) {
        setAnalysisResults(response.data);
        Toast.show({
          type: 'success',
          text1: 'Analysis Complete',
          text2: 'Image analyzed successfully!',
        });
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
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
            imageUri={selectedImage}
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