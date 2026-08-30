import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';

interface Props {
  icon: LucideIcon;
  onPress?: () => void;
  tone?: 'onBrand' | 'default' | 'ghost';
  size?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  tone = 'default',
  size = 44,
  style,
  accessibilityLabel,
}: Props) {
  const t = useTheme();
  const bg =
    tone === 'onBrand'
      ? 'rgba(255,255,255,0.16)'
      : tone === 'ghost'
        ? 'transparent'
        : t.color.surface;
  const fg = tone === 'onBrand' ? t.brand.onPrimary : t.color.inkSoft;
  const border = tone === 'default' ? t.color.line : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: t.radius.md,
          backgroundColor: bg,
          borderWidth: tone === 'default' ? 1 : 0,
          borderColor: border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Icon size={20} color={fg} strokeWidth={2.2} />
    </Pressable>
  );
}
