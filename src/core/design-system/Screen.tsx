import React from 'react';
import { ScrollView, View, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme/ThemeProvider';

interface Props {
  children?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** respeita a safe-area no topo (desligue quando há BrandHeader colorido). */
  edgeTop?: boolean;
  bg?: 'bg' | 'surface' | 'inset';
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edgeTop = true,
  bg = 'bg',
  contentStyle,
  refreshing,
  onRefresh,
  footer,
}: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const background =
    bg === 'surface' ? t.color.surface : bg === 'inset' ? t.color.bgInset : t.color.bg;

  const pad: ViewStyle = {
    paddingHorizontal: padded ? t.spacing.lg : 0,
    paddingTop: edgeTop ? insets.top + t.spacing.md : t.spacing.md,
    paddingBottom: t.spacing['3xl'] + insets.bottom,
  };

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: background }, pad, contentStyle]}>
        {children}
        {footer}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <ScrollView
        contentContainerStyle={[pad, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={t.brand.primary}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}
