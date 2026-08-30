import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import type { StatusTone } from '@core/theme/tokens';
import { Text } from './Text';

interface Props {
  value: string;
  label: string;
  icon?: LucideIcon;
  tone?: StatusTone;
  mono?: boolean;
  style?: ViewStyle;
}

/** Tile de indicador (KPI). Valor em mono por padrão. */
export function Stat({ value, label, icon: Icon, tone, mono = true, style }: Props) {
  const t = useTheme();
  const accent = tone ? t.status[tone].dot : t.brand.primary;
  return (
    <View
      style={[
        {
          flex: 1,
          minWidth: 0,
          backgroundColor: t.color.surface,
          borderRadius: t.radius.lg,
          borderWidth: 1,
          borderColor: t.color.line,
          padding: t.spacing.md,
          gap: 6,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontFamily: mono ? t.fontFamily.mono : t.fontFamily.bold,
            fontSize: t.fontSize.xl,
            lineHeight: t.fontSize.xl * 1.2,
            color: t.color.ink,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
        {Icon && <Icon size={18} color={accent} strokeWidth={2.2} />}
      </View>
      <Text variant="caption" color="muted" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
