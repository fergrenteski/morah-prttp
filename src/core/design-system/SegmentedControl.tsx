import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ segments, value, onChange }: Props<T>) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.color.bgInset,
        borderRadius: t.radius.md,
        padding: 4,
        gap: 4,
      }}
    >
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            style={{
              flex: 1,
              minHeight: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: t.radius.sm,
              backgroundColor: active ? t.color.surface : 'transparent',
              ...(active ? t.elevation.card : null),
            }}
          >
            <Text
              variant="label"
              style={{ color: active ? t.brand.primaryStrong : t.color.muted }}
              numberOfLines={1}
            >
              {s.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
