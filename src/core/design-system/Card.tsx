import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  tone?: 'surface' | 'tint' | 'inset';
  radius?: 'md' | 'lg' | 'xl' | '2xl';
  raised?: boolean;
  accent?: boolean; // barra lateral com cor de marca
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  padded = true,
  tone = 'surface',
  radius = 'xl',
  raised = false,
  accent = false,
  style,
}: Props) {
  const t = useTheme();
  const bg =
    tone === 'tint' ? t.brand.tint : tone === 'inset' ? t.color.bgInset : t.color.surface;

  const base: ViewStyle = {
    backgroundColor: bg,
    borderRadius: t.radius[radius],
    padding: padded ? t.spacing.lg : 0,
    borderWidth: tone === 'surface' ? 1 : 0,
    borderColor: t.color.line,
    overflow: 'hidden',
    ...(raised ? t.elevation.card : null),
  };

  const content = (
    <>
      {accent && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: t.brand.primary,
          }}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.7 }, style]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{content}</View>;
}
