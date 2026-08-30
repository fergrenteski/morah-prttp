import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  title: string;
  action?: React.ReactNode;
  overline?: string;
  style?: object;
}

export function SectionHeader({ title, action, overline, style }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: t.spacing.md,
          marginTop: t.spacing.xl,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        {overline && (
          <Text variant="overline" color="brand" style={{ marginBottom: 2 }}>
            {overline}
          </Text>
        )}
        <Text variant="heading">{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function Divider({ spacing = 0 }: { spacing?: number }) {
  const t = useTheme();
  return (
    <View
      style={{ height: 1, backgroundColor: t.color.line, marginVertical: spacing }}
    />
  );
}
