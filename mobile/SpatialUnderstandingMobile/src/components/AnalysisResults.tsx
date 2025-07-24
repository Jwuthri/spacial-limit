import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

// Constants
import { COLORS, SPACING, FONT_SIZES } from '@/constants';

// Types
import { DetectionType, BoundingBox2D, BoundingBox3D, Point } from '@/types';

interface AnalysisResultsProps {
  results: any[];
  detectionType: DetectionType;
  imageUri: string | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  detectionType,
  imageUri,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageDisplayWidth = screenWidth - SPACING.md * 2;

  const renderBoundingBox2D = (result: BoundingBox2D, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Box: ({result.x1.toFixed(0)}, {result.y1.toFixed(0)}) → 
        ({result.x2.toFixed(0)}, {result.y2.toFixed(0)})
      </Text>
    </View>
  );

  const renderBoundingBox3D = (result: BoundingBox3D, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        2D: ({result.x1.toFixed(0)}, {result.y1.toFixed(0)}) → 
        ({result.x2.toFixed(0)}, {result.y2.toFixed(0)})
      </Text>
      {result.z1 !== undefined && result.z2 !== undefined && (
        <Text style={styles.resultCoordinates}>
          3D Depth: {result.z1.toFixed(2)} → {result.z2.toFixed(2)}
        </Text>
      )}
    </View>
  );

  const renderPoint = (result: Point, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Point: ({result.x.toFixed(0)}, {result.y.toFixed(0)})
      </Text>
    </View>
  );

  const renderSegmentationMask = (result: any, index: number) => (
    <View key={index} style={styles.resultItem}>
      <Text style={styles.resultLabel}>{result.label}</Text>
      <Text style={styles.resultConfidence}>
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={styles.resultCoordinates}>
        Segmentation mask available
      </Text>
    </View>
  );

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

      {/* Image with overlays (simplified for mobile) */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={[styles.resultImage, { width: imageDisplayWidth }]}
            resizeMode="contain"
          />
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
  resultImage: {
    height: 200,
    borderRadius: SPACING.xs,
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
});

export default AnalysisResults; 