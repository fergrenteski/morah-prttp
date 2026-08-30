import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}

/** Linha rótulo → valor para telas de detalhe. */
export function DataRow({ label, value, mono = false, strong = false }: Props) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: t.spacing.sm,
        gap: t.spacing.md,
      }}
    >
      <Text variant="label" color="muted">
        {label}
      </Text>
      <Text
        variant={strong ? 'subheading' : 'label'}
        style={{
          color: t.color.ink,
          fontFamily: mono ? t.fontFamily.mono : undefined,
          flexShrink: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}
