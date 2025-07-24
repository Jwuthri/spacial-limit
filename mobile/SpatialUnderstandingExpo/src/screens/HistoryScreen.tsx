import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';

// Services
import { apiService } from '@/services/api';

// Constants
import { COLORS, SPACING, FONT_SIZES } from '@/constants';

// Types
import { Prediction, ApiResponse } from '@/types';

interface HistoryItemProps {
  item: Prediction;
  onPress: (item: Prediction) => void;
  onDelete: (id: number) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onPress, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Prediction',
      'Are you sure you want to delete this prediction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.historyItem} onPress={() => onPress(item)}>
      <View style={styles.historyItemContent}>
        <Image source={{ uri: `data:image/jpeg;base64,${item.image_data}` }} style={styles.thumbnailImage} />
        <View style={styles.historyItemDetails}>
          <Text style={styles.historyItemTitle}>{item.detect_type}</Text>
          <Text style={styles.historyItemSubtitle}>{item.target_prompt}</Text>
          <Text style={styles.historyItemDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.historyItemTime}>
            Processing: {item.processing_time?.toFixed(2)}s
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const HistoryScreen: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response: ApiResponse<Prediction[]> = await apiService.getHistory();
      if (response.success) {
        setPredictions(response.data);
      } else {
        throw new Error(response.error || 'Failed to load history');
      }
    } catch (error) {
      console.error('Error loading history:', error);
      Toast.show({
        type: 'error',
        text1: 'Load Failed',
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleItemPress = (item: Prediction) => {
    Alert.alert(
      'Prediction Details',
      `Type: ${item.detect_type}\nPrompt: ${item.target_prompt}\nLanguage: ${item.segmentation_language}\nTemperature: ${item.temperature}\nResults: ${item.results?.length || 0} items found`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await apiService.deletePrediction(id);
      if (response.success) {
        setPredictions(prev => prev.filter(item => item.id !== id));
        Toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Prediction deleted successfully',
        });
      } else {
        throw new Error(response.error || 'Failed to delete prediction');
      }
    } catch (error) {
      console.error('Error deleting prediction:', error);
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.message,
      });
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Analysis History</Text>
      <Text style={styles.emptyStateSubtitle}>
        Analyze some images to see your history here
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            onPress={handleItemPress}
            onDelete={handleDeleteItem}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadHistory(true)}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={predictions.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyItemContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: SPACING.xs,
    marginRight: SPACING.md,
  },
  historyItemDetails: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  historyItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  historyItemDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  historyItemTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});

export default HistoryScreen; 