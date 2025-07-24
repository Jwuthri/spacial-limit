import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

// Constants
import { COLORS, SPACING, FONT_SIZES } from '@/constants';

// Types
import { DetectionType, BoundingBox2D, BoundingBox3D, Point } from '@/types';

interface AnalysisResultsProps {
  results: any[];
  detectionType: DetectionType;
  imageUri: string | null;
  useBackendOverlay?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  detectionType,
  imageUri,
  useBackendOverlay = false,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageDisplayWidth = screenWidth - SPACING.md * 2;
  const imageContainerRef = React.useRef<View>(null);

  const saveImageWithOverlays = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions to save the image.');
        return;
      }

      console.log('Checking ref:', imageContainerRef.current);
      
      if (!imageContainerRef.current) {
        Alert.alert('Error', 'Image container not ready for capture');
        return;
      }

      console.log('Starting capture...');
      
      // Add a small delay to ensure view is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the image with overlays
      const uri = await captureRef(imageContainerRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      console.log('Captured image to:', uri);

      // Save to photo library
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image with bounding boxes saved to photo library!');
      
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', `Failed to save image: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const renderBoundingBox2D = (result: any, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label || 'Unknown'}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Top-Left: ({(result.x || 0).toFixed(3)}, {(result.y || 0).toFixed(3)})
      </Text>
      <Text style={styles.resultCoordinates}>
        Size: {(result.width || 0).toFixed(3)} × {(result.height || 0).toFixed(3)}
      </Text>
    </View>
  );

  const renderBoundingBox3D = (result: any, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label || 'Unknown'}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Center: ({(result.center?.[0] || 0).toFixed(3)}, {(result.center?.[1] || 0).toFixed(3)}, {(result.center?.[2] || 0).toFixed(3)})
      </Text>
      <Text style={styles.resultCoordinates}>
        Size: {(result.size?.[0] || 0).toFixed(3)} × {(result.size?.[1] || 0).toFixed(3)} × {(result.size?.[2] || 0).toFixed(3)}
      </Text>
    </View>
  );

  const renderPoint = (result: Point, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label || 'Unknown'}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Point: ({(result.x || 0).toFixed(0)}, {(result.y || 0).toFixed(0)})
      </Text>
    </View>
  );

  const renderSegmentationMask = (result: any, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label || 'Unknown'}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Segmentation mask available
      </Text>
    </View>
  );

  // Render visual overlays on the image
  const renderOverlays = () => {
    if (!results || results.length === 0) return null;

    // Use fixed aspect ratio that matches the image display (adjust this based on your images)
    const imageHeight = 200; // Same as resultImage height in styles
    
    // Debug: Log first result to see coordinate format
    if (results.length > 0) {
      console.log('First result coordinates:', results[0]);
    }
    
    return results.map((result, index) => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
      const color = colors[index % colors.length];

      switch (detectionType) {
        case '2D bounding boxes':
          return renderBoundingBoxOverlay(result, index, color, imageDisplayWidth, imageHeight);
        case 'Points':
          return renderPointOverlay(result, index, color, imageDisplayWidth, imageHeight);
        default:
          return null;
      }
    });
  };

  // Render bounding box overlay
  const renderBoundingBoxOverlay = (
    result: any, 
    index: number, 
    color: string,
    imageWidth: number,
    imageHeight: number
  ) => {
    // Backend returns normalized coordinates (0-1) - x,y are TOP-LEFT coordinates
    if (result.x === undefined || result.y === undefined) return null;

    // Backend coordinates: x,y = top-left corner, width,height = dimensions
    const leftPercent = result.x * 100;
    const topPercent = result.y * 100; 
    const widthPercent = (result.width || 0) * 100;
    const heightPercent = (result.height || 0) * 100;

    // Convert percentages to pixels for React Native
    const left = (leftPercent / 100) * imageWidth;
    const top = (topPercent / 100) * imageHeight;
    const width = (widthPercent / 100) * imageWidth;
    const height = (heightPercent / 100) * imageHeight;

    // Debug log for first few boxes
    if (index < 3) {
      console.log(`Box ${index}: top-left(${result.x.toFixed(3)}, ${result.y.toFixed(3)}) size(${result.width.toFixed(3)}, ${result.height.toFixed(3)}) → pixels(${left.toFixed(1)}, ${top.toFixed(1)}, ${width.toFixed(1)}, ${height.toFixed(1)})`);
    }

    return (
      <View
        key={`box-${index}`}
        style={[
          styles.boundingBox,
          {
            left: Math.max(0, left),
            top: Math.max(0, top),
            width: Math.max(1, Math.abs(width)),
            height: Math.max(1, Math.abs(height)),
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.overlayLabel, { color }]}>
          {result.label} ({((result.confidence || 0) * 100).toFixed(0)}%)
        </Text>
      </View>
    );
  };

  // Render point overlay
  const renderPointOverlay = (
    result: any,
    index: number,
    color: string,
    imageWidth: number,
    imageHeight: number
  ) => {
    if (result.x === undefined || result.y === undefined) return null;

    // Use same coordinate system as web frontend (normalized 0-1)
    const x = result.x * imageWidth - 10; // Center the point
    const y = result.y * imageHeight - 10;

    return (
      <View
        key={`point-${index}`}
        style={[
          styles.pointOverlay,
          {
            left: x,
            top: y,
            backgroundColor: color,
          },
        ]}
      >
        <Text style={styles.pointLabel}>
          {result.label}
        </Text>
      </View>
    );
  };

  const renderResults = () => {
    if (!results || results.length === 0) {
      return (
        <Text style={styles.noResultsText}>
          No {detectionType.toLowerCase()} detected
        </Text>
      );
    }

    return results.map((result, index) => {
      switch (detectionType) {
        case '2D bounding boxes':
          return renderBoundingBox2D(result, index);
        case '3D bounding boxes':
          return renderBoundingBox3D(result, index);
        case 'Points':
          return renderPoint(result, index);
        case 'Segmentation masks':
          return renderSegmentationMask(result, index);
        default:
          return (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultLabel}>
                {result.label || `Item ${index + 1}`}
              </Text>
              <Text style={styles.resultConfidence}>
                Confidence: {((result.confidence || 0) * 100).toFixed(1)}%
              </Text>
            </View>
          );
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis Results</Text>
      
      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Detection Type: {detectionType}
        </Text>
        <Text style={styles.summaryText}>
          Items Found: {results?.length || 0}
        </Text>
      </View>

      {/* Image with overlays */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper} ref={imageContainerRef}>
            <Image 
              source={{ uri: imageUri }} 
              style={[styles.resultImage, { width: imageDisplayWidth }]}
              resizeMode="contain"
              onLoad={(event) => {
                const { width, height } = event.nativeEvent.source;
                // Store original image dimensions for overlay calculations
              }}
            />
            {/* Render overlays on top of image only if not using backend overlay */}
            {!useBackendOverlay && renderOverlays()}
          </View>
          
          {/* Save button - only show for frontend overlays */}
          {results && results.length > 0 && !useBackendOverlay && (
            <TouchableOpacity style={styles.saveButton} onPress={saveImageWithOverlays}>
              <Text style={styles.saveButtonText}>Save Image with Boxes</Text>
            </TouchableOpacity>
          )}
          
          {/* Info text for backend overlay */}
          {useBackendOverlay && results && results.length > 0 && (
            <Text style={styles.overlayInfo}>
              Bounding boxes drawn by backend - save from photo viewer
            </Text>
          )}
        </View>
      )}

      {/* Results List */}
      <ScrollView style={styles.resultsContainer} nestedScrollEnabled>
        {renderResults()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  resultImage: {
    height: 200,
    borderRadius: SPACING.xs,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  overlayLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  pointOverlay: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointLabel: {
    position: 'absolute',
    top: 25,
    left: -15,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    minWidth: 30,
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 300,
  },
  resultItem: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  resultLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultConfidence: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  resultCoordinates: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SPACING.lg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xs,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  overlayInfo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default AnalysisResults; 