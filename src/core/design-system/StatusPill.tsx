import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import type { StatusTone } from '@core/theme/tokens';
import { Text } from './Text';

interface Props {
  label: string;
  tone?: StatusTone;
  dot?: boolean;
  style?: ViewStyle;
}

/** Pílula de estado semântico — cores independentes da marca do tenant. */
export function StatusPill({ label, tone = 'neutral', dot = true, style }: Props) {
  const t = useTheme();
  const s = t.status[tone];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: s.bg,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: t.radius.pill,
        },
        style,
      ]}
    >
      {dot && (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.dot }} />
      )}
      <Text variant="caption" style={{ color: s.fg }}>
        {label}
      </Text>
    </View>
  );
}
