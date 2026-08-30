import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, LucideIcon } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  label?: string;
  icon?: LucideIcon;
  onPress: () => void;
}

/** Botão de ação flutuante fixo no rodapé (respeita safe-area). */
export function Fab({ label, icon: Icon = Plus, onPress }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: t.spacing.lg,
        bottom: insets.bottom + t.spacing.lg,
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Adicionar'}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.sm,
            height: 52,
            paddingHorizontal: label ? t.spacing.lg : 0,
            width: label ? undefined : 52,
            justifyContent: 'center',
            borderRadius: t.radius.pill,
            backgroundColor: t.brand.primary,
            opacity: pressed ? 0.9 : 1,
            ...t.elevation.raised,
          },
        ]}
      >
        <Icon size={22} color={t.brand.onPrimary} strokeWidth={2.4} />
        {label && (
          <Text variant="subheading" style={{ color: t.brand.onPrimary }}>
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
