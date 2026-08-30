import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  initials: string;
  size?: number;
  tone?: 'brand' | 'neutral';
  square?: boolean;
  style?: ViewStyle;
}

export function Avatar({ initials, size = 44, tone = 'brand', square = false, style }: Props) {
  const t = useTheme();
  const bg = tone === 'brand' ? t.brand.primary : t.color.bgInset;
  const fg = tone === 'brand' ? t.brand.onPrimary : t.color.inkSoft;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: square ? t.radius.md : size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontFamily: t.fontFamily.bold, fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </View>
  );
}
