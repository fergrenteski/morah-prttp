import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { HIT_SLOP_MIN } from '@core/theme/tokens';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  leadingIcon?: LucideIcon;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  style?: ViewStyle;
}

export function ListItem({
  title,
  subtitle,
  leadingIcon: Icon,
  leading,
  trailing,
  onPress,
  chevron = false,
  danger = false,
  style,
}: Props) {
  const t = useTheme();
  const tint = danger ? t.status.danger.fg : t.color.ink;

  const body = (
    <View
      style={[
        {
          minHeight: HIT_SLOP_MIN,
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.spacing.md,
          paddingVertical: t.spacing.sm,
        },
        style,
      ]}
    >
      {leading}
      {Icon && !leading && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: t.radius.md,
            backgroundColor: t.brand.tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color={t.brand.primaryStrong} strokeWidth={2.2} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="subheading" style={{ color: tint }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="muted" numberOfLines={2} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {chevron && <ChevronRight size={18} color={t.color.faint} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}>
        {body}
      </Pressable>
    );
  }
  return body;
}
