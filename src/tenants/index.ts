/**
 * Catálogo de tenants da Linha de Produção.
 *
 * Adicionar um novo condomínio-cliente = criar um novo JSON e registrá-lo aqui
 * (NF-09). Nenhuma tela precisa mudar.
 */
import type { Tenant, TenantRules } from '@core/theme/types';
import fariaLima from './faria-lima-corporate.json';
import jardimAcacias from './jardim-das-acacias.json';

export const TENANTS: Tenant[] = [fariaLima as Tenant, jardimAcacias as Tenant];

export const DEFAULT_TENANT_ID = fariaLima.id;

/** Regras-padrão da linha de produção; cada tenant sobrepõe o que precisar. */
export const DEFAULT_RULES: TenantRules = {
  slaHoras: { baixa: 72, media: 48, alta: 24, critica: 8 },
  lavanderiaCiclosInclusos: 8,
  lavanderiaValorExcedente: 12.5,
  reservaAntecedenciaMinimaHoras: 12,
};

export function getTenant(id: string): Tenant {
  return TENANTS.find((t) => t.id === id) ?? TENANTS[0];
}

export function resolveRules(tenant: Tenant): TenantRules {
  return { ...DEFAULT_RULES, ...(tenant.rules ?? {}) };
}
