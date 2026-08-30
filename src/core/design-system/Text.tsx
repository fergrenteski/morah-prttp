import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline';

type ColorToken = 'ink' | 'inkSoft' | 'muted' | 'faint' | 'onPrimary' | 'brand' | 'brandStrong';

interface Props extends RNTextProps {
  variant?: TextVariant;
  color?: ColorToken;
  mono?: boolean;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

export function Text({
  variant = 'body',
  color = 'ink',
  mono = false,
  center = false,
  style,
  children,
  ...rest
}: Props) {
  const t = useTheme();

  const variants: Record<TextVariant, TextStyle> = {
    display: { fontSize: t.fontSize['3xl'], lineHeight: t.fontSize['3xl'] * 1.18, fontFamily: t.fontFamily.bold, letterSpacing: -0.5 },
    title: { fontSize: t.fontSize.xl, lineHeight: t.fontSize.xl * 1.2, fontFamily: t.fontFamily.bold, letterSpacing: -0.3 },
    heading: { fontSize: t.fontSize.lg, lineHeight: t.fontSize.lg * 1.25, fontFamily: t.fontFamily.semibold, letterSpacing: -0.2 },
    subheading: { fontSize: t.fontSize.md, lineHeight: t.fontSize.md * 1.3, fontFamily: t.fontFamily.semibold },
    body: { fontSize: t.fontSize.md, fontFamily: t.fontFamily.regular, lineHeight: 22 },
    bodyStrong: { fontSize: t.fontSize.md, fontFamily: t.fontFamily.semibold, lineHeight: 22 },
    label: { fontSize: t.fontSize.sm, fontFamily: t.fontFamily.medium },
    caption: { fontSize: t.fontSize.xs, fontFamily: t.fontFamily.medium },
    overline: {
      fontSize: t.fontSize.xs,
      fontFamily: t.fontFamily.semibold,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
  };

  const colors: Record<ColorToken, string> = {
    ink: t.color.ink,
    inkSoft: t.color.inkSoft,
    muted: t.color.muted,
    faint: t.color.faint,
    onPrimary: t.brand.onPrimary,
    brand: t.brand.primary,
    brandStrong: t.brand.primaryStrong,
  };

  return (
    <RNText
      {...rest}
      style={[
        variants[variant],
        { color: colors[color] },
        mono && { fontFamily: t.fontFamily.mono },
        center && { textAlign: 'center' },
        style as TextStyle,
      ]}
    >
      {children}
    </RNText>
  );
}
