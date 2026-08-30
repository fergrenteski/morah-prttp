import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Chip de filtro/seleção — usa a marca do tenant quando selecionado. */
export function Chip({ label, selected = false, onPress, style }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: t.spacing.md,
          paddingVertical: 8,
          borderRadius: t.radius.pill,
          borderWidth: 1,
          backgroundColor: selected ? t.brand.primary : t.color.surface,
          borderColor: selected ? t.brand.primary : t.color.line,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text
        variant="label"
        style={{ color: selected ? t.brand.onPrimary : t.color.inkSoft }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
