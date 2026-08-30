/**
 * Contrato de configuração de um Tenant (condomínio-cliente).
 *
 * Este é o "schema de variante" da Linha de Produção: criar um novo cliente
 * personalizado é preencher um JSON com esta forma — nenhum código novo.
 */

export type TenantPlan = 'basico' | 'basico_mais_addons' | 'completo';
export type TenantKind = 'residencial' | 'comercial';

export interface TenantBrand {
  primary: string;
  primaryStrong: string;
  secondary: string;
  tint: string;
  onPrimary: string;
}

export interface Tenant {
  id: string;
  name: string;
  initials: string;
  kind: TenantKind;
  brand: TenantBrand;
  plan: TenantPlan;
  /** Slugs de módulos habilitados — ver moduleRegistry. */
  enabledModules: string[];
  /** Funções exclusivas deste cliente (feature flags custom). */
  customFeatures: string[];
  /** Parâmetros de regras de negócio ajustáveis por cliente. */
  rules?: Partial<TenantRules>;
}

/** Parâmetros que alimentam o motor de regras (src/shared/rules). */
export interface TenantRules {
  /** Horas de SLA por prioridade de ocorrência. */
  slaHoras: { baixa: number; media: number; alta: number; critica: number };
  /** Ciclos de lavanderia inclusos antes de cobrar excedente. */
  lavanderiaCiclosInclusos: number;
  /** Valor por ciclo excedente de lavanderia (R$). */
  lavanderiaValorExcedente: number;
  /** Antecedência mínima (horas) para reservar área comum. */
  reservaAntecedenciaMinimaHoras: number;
}

/** Tema resolvido = tokens base + marca do tenant ativo. Consumido via useTheme(). */
export interface ResolvedTheme {
  brand: TenantBrand;
  tenantId: string;
}
