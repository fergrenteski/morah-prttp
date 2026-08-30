/**
 * ThemeProvider — injeta o tema resolvido (tokens base + marca do tenant ativo)
 * via Context. Deriva reativamente do tenantStore, então a troca de condomínio
 * re-temiza toda a árvore instantaneamente (NF-02).
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useTenant } from '@core/state/tenantStore';
import type { TenantBrand } from './types';
import {
  spacing,
  radius,
  fontSize,
  fontWeight,
  fontFamily,
  neutral,
  status,
  elevation,
} from './tokens';

export interface Theme {
  brand: TenantBrand;
  tenantId: string;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  fontFamily: typeof fontFamily;
  color: typeof neutral;
  status: typeof status;
  elevation: typeof elevation;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();

  const theme = useMemo<Theme>(
    () => ({
      brand: tenant.brand,
      tenantId: tenant.id,
      spacing,
      radius,
      fontSize,
      fontWeight,
      fontFamily,
      color: neutral,
      status,
      elevation,
    }),
    [tenant],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}
