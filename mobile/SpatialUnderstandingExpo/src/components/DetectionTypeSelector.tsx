import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Constants
import { COLORS, SPACING, FONT_SIZES, DETECTION_TYPES } from '@/constants';

// Types
import { DetectionType } from '@/types';

interface DetectionTypeSelectorProps {
  selectedType: DetectionType;
  onTypeChange: (type: DetectionType) => void;
}

const DetectionTypeSelector: React.FC<DetectionTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detection Type</Text>
      <View style={styles.optionsContainer}>
        {DETECTION_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              selectedType === type && styles.selectedOption,
            ]}
            onPress={() => onTypeChange(type)}
          >
            <View style={[
              styles.radioButton,
              selectedType === type && styles.selectedRadioButton,
            ]} />
            <Text style={[
              styles.optionText,
              selectedType === type && styles.selectedOptionText,
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  optionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedRadioButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default DetectionTypeSelector; 