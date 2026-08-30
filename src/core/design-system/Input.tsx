import React, { useState } from 'react';
import { View, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  hint,
  error,
  mono = false,
  containerStyle,
  style,
  ...rest
}: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? t.status.danger.dot
    : focused
      ? t.brand.primary
      : t.color.line;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text variant="label" color="inkSoft">
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={t.color.faint}
        style={[
          {
            minHeight: 48,
            borderWidth: 1.5,
            borderColor,
            borderRadius: t.radius.md,
            paddingHorizontal: t.spacing.md,
            paddingVertical: t.spacing.sm,
            fontSize: t.fontSize.md,
            fontFamily: mono ? t.fontFamily.mono : t.fontFamily.regular,
            color: t.color.ink,
            backgroundColor: t.color.surface,
          },
          style,
        ]}
      />
      {(hint || error) && (
        <Text variant="caption" style={{ color: error ? t.status.danger.fg : t.color.muted }}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
