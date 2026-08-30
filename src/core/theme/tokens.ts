/**
 * tokens.ts — Escala base do Design System (agnóstica de marca).
 *
 * Estes valores NÃO dependem de nenhum tenant. As cores de marca
 * (brand.primary, etc.) chegam pelo ThemeProvider a partir do tenant ativo.
 * Aqui vivem apenas: espaçamento, raio, tipografia, elevação e as cores
 * SEMÂNTICAS de estado (aprovado/pendente/etc.), que precisam funcionar
 * sobre qualquer cor de marca.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  xs: 2,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
} as const;

export const fontSize = {
  xs: 11.5,
  sm: 13.5,
  md: 15.5,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  regular: 'PublicSans_400Regular',
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
  mono: 'IBMPlexMono_500Medium',
  monoRegular: 'IBMPlexMono_400Regular',
} as const;

/** Área de toque mínima para acessibilidade (NF-06). */
export const HIT_SLOP_MIN = 48;

/** Paleta neutra (superfícies, textos, bordas) — comum a todos os tenants. */
export const neutral = {
  ink: '#0F172A',
  inkSoft: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E2E8F0',
  lineSoft: '#EEF2F6',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  bg: '#F5F7FA',
  bgInset: '#EFF3F8',
  onDark: '#F8FAFC',
} as const;

/**
 * Cores semânticas de status — par (fundo/texto) para cada estado.
 * Independentes da marca: leem-se sempre iguais em qualquer condomínio.
 */
export type StatusTone =
  | 'success'
  | 'approved'
  | 'pending'
  | 'neutral'
  | 'danger'
  | 'info';

export const status: Record<StatusTone, { bg: string; fg: string; dot: string }> = {
  success: { bg: '#DCFCE7', fg: '#166534', dot: '#16A34A' },
  approved: { bg: '#E0F2FE', fg: '#075985', dot: '#0284C7' },
  pending: { bg: '#FEF3C7', fg: '#92400E', dot: '#D97706' },
  neutral: { bg: '#EEF2F6', fg: '#475569', dot: '#94A3B8' },
  danger: { bg: '#FEE2E2', fg: '#991B1B', dot: '#DC2626' },
  info: { bg: '#EDE9FE', fg: '#5B21B6', dot: '#7C3AED' },
};

export const elevation = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type FontSize = keyof typeof fontSize;
