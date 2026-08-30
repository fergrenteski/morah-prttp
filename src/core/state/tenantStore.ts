/**
 * tenantStore — fonte da verdade sobre o condomínio-cliente ativo.
 *
 * Trocar de tenant re-temiza toda a UI em tempo real (NF-02), porque o
 * ThemeProvider e as telas derivam desta store reativa.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTenant, resolveRules, DEFAULT_TENANT_ID } from '@tenants/index';
import type { Tenant, TenantRules } from '@core/theme/types';

interface TenantState {
  activeTenantId: string;
  setTenant: (id: string) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: DEFAULT_TENANT_ID,
      setTenant: (id) => set({ activeTenantId: id }),
    }),
    {
      name: 'spl.tenant',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Hook de conveniência: retorna o tenant resolvido + regras + setter. */
export function useTenant(): {
  tenant: Tenant;
  rules: TenantRules;
  setTenant: (id: string) => void;
  hasModule: (slug: string) => boolean;
  hasFeature: (feature: string) => boolean;
} {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const setTenant = useTenantStore((s) => s.setTenant);
  const tenant = getTenant(activeTenantId);
  const rules = resolveRules(tenant);
  return {
    tenant,
    rules,
    setTenant,
    hasModule: (slug) => tenant.enabledModules.includes(slug),
    hasFeature: (feature) => tenant.customFeatures.includes(feature),
  };
}
