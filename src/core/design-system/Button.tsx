import React from 'react';
import { Pressable, ActivityIndicator, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { HIT_SLOP_MIN } from '@core/theme/tokens';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const t = useTheme();

  const heights: Record<Size, number> = { sm: 40, md: HIT_SLOP_MIN, lg: 56 };
  const padX: Record<Size, number> = { sm: t.spacing.md, md: t.spacing.lg, lg: t.spacing.xl };

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: t.brand.primary, fg: t.brand.onPrimary, border: t.brand.primary },
    secondary: { bg: t.brand.tint, fg: t.brand.primaryStrong, border: t.brand.tint },
    outline: { bg: 'transparent', fg: t.brand.primary, border: t.color.line },
    ghost: { bg: 'transparent', fg: t.brand.primary, border: 'transparent' },
    danger: { bg: t.status.danger.bg, fg: t.status.danger.fg, border: t.status.danger.bg },
  };
  const p = palette[variant];
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          minHeight: heights[size],
          paddingHorizontal: padX[size],
          borderRadius: t.radius.pill,
          backgroundColor: p.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: p.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.spacing.sm,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} />
      ) : (
        <>
          {Icon && <Icon size={iconSize} color={p.fg} strokeWidth={2.2} />}
          <Text
            variant={size === 'sm' ? 'label' : 'subheading'}
            style={{ color: p.fg }}
          >
            {label}
          </Text>
          {IconRight && <IconRight size={iconSize} color={p.fg} strokeWidth={2.2} />}
        </>
      )}
    </Pressable>
  );
}
