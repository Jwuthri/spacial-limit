import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';

// Constants
import { COLORS, SPACING, FONT_SIZES, SEGMENTATION_LANGUAGES } from '@/constants';

interface PromptPanelProps {
  targetPrompt: string;
  labelPrompt: string;
  segmentationLanguage: string;
  temperature: number;
  onTargetPromptChange: (prompt: string) => void;
  onLabelPromptChange: (prompt: string) => void;
  onSegmentationLanguageChange: (language: string) => void;
  onTemperatureChange: (temperature: number) => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({
  targetPrompt,
  labelPrompt,
  segmentationLanguage,
  temperature,
  onTargetPromptChange,
  onLabelPromptChange,
  onSegmentationLanguageChange,
  onTemperatureChange,
}) => {
  const [showLanguagePicker, setShowLanguagePicker] = React.useState(false);

  const renderLanguageItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => {
        onSegmentationLanguageChange(item);
        setShowLanguagePicker(false);
      }}
    >
      <Text style={[
        styles.languageItemText,
        item === segmentationLanguage && styles.selectedLanguageText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration</Text>
      
      <View style={styles.panel}>
        {/* Target Prompt */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>What to detect:</Text>
          <TextInput
            style={styles.textInput}
            value={targetPrompt}
            onChangeText={onTargetPromptChange}
            placeholder="e.g., items, people, cars"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Label Prompt */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Label prompt (optional):</Text>
          <TextInput
            style={styles.textInput}
            value={labelPrompt}
            onChangeText={onLabelPromptChange}
            placeholder="e.g., describe each item"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Segmentation Language */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Language:</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text style={styles.pickerButtonText}>{segmentationLanguage}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Temperature */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Temperature: {temperature.toFixed(1)}</Text>
          <View style={styles.temperatureContainer}>
            <TouchableOpacity
              style={styles.temperatureButton}
              onPress={() => onTemperatureChange(Math.max(0, temperature - 0.1))}
            >
              <Text style={styles.temperatureButtonText}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.temperatureSlider}>
              <View
                style={[
                  styles.temperatureProgress,
                  { width: `${(temperature / 2) * 100}%` }
                ]}
              />
            </View>
            
            <TouchableOpacity
              style={styles.temperatureButton}
              onPress={() => onTemperatureChange(Math.min(2, temperature + 0.1))}
            >
              <Text style={styles.temperatureButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLanguagePicker(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={SEGMENTATION_LANGUAGES}
              keyExtractor={(item) => item}
              renderItem={renderLanguageItem}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  pickerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  pickerArrow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  temperatureButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  temperatureButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  temperatureSlider: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
    borderRadius: 2,
  },
  temperatureProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    width: '80%',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  selectedLanguageText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default PromptPanel; 