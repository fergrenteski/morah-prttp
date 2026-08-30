import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  /** exibe o botão voltar */
  back?: boolean;
  right?: React.ReactNode;
  /** ícone à esquerda do título (quando não é "voltar") */
  icon?: LucideIcon;
  /** eyebrow em mono/uppercase acima do título (ex.: código de unidade) */
  eyebrow?: string;
  children?: React.ReactNode;
}

/**
 * BrandHeader — elemento-assinatura do app.
 *
 * Barra colorida que carrega a identidade do condomínio ativo e RE-TEMIZA ao
 * vivo quando o tenant muda. Sangra na safe-area do topo. Usar com
 * <Screen edgeTop={false}> logo abaixo.
 */
export function BrandHeader({ title, subtitle, back, right, icon: Icon, eyebrow, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: t.brand.primary,
        paddingTop: insets.top + t.spacing.sm,
        paddingBottom: children ? t.spacing.lg : t.spacing.lg,
        paddingHorizontal: t.spacing.lg,
        borderBottomLeftRadius: t.radius['2xl'],
        borderBottomRightRadius: t.radius['2xl'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        {back && (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              marginLeft: -8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={26} color={t.brand.onPrimary} />
          </Pressable>
        )}
        {Icon && !back && (
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: t.radius.md,
              backgroundColor: 'rgba(255,255,255,0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} color={t.brand.onPrimary} strokeWidth={2.2} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {eyebrow && (
            <Text
              style={{
                fontFamily: t.fontFamily.mono,
                fontSize: t.fontSize.xs,
                color: t.brand.onPrimary,
                opacity: 0.75,
                letterSpacing: 0.5,
                marginBottom: 1,
              }}
            >
              {eyebrow}
            </Text>
          )}
          <Text variant="title" color="onPrimary" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="label"
              color="onPrimary"
              style={{ opacity: 0.82, marginTop: 1 }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}
