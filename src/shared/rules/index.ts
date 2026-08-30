/**
 * Motor de regras de negócio parametrizável (ativo reutilizável nº 5).
 *
 * As regras recebem os parâmetros do tenant (TenantRules) como argumento —
 * nada é hard-coded. O mesmo cálculo de SLA/excedente/elegibilidade serve
 * qualquer condomínio, mudando só os parâmetros.
 */
import type { TenantRules } from '@core/theme/types';
import type { Ocorrencia, Prioridade, StatusTone } from '@shared/types';

/* ------------------------------- SLA ---------------------------------- */

export interface SlaInfo {
  prazoISO: string;
  horasRestantes: number;
  violado: boolean;
  emRisco: boolean; // < 25% do prazo restante
  tone: StatusTone;
  rotulo: string;
}

export function calcularSla(
  ocorrencia: Ocorrencia,
  rules: TenantRules,
  agora: number = Date.now(),
): SlaInfo {
  const horas = rules.slaHoras[ocorrencia.prioridade];
  const aberta = new Date(ocorrencia.abertaEm).getTime();
  const prazo = aberta + horas * 3600_000;
  const encerrada =
    ocorrencia.status === 'resolvida' || ocorrencia.status === 'encerrada';

  const horasRestantes = (prazo - agora) / 3600_000;
  const violado = !encerrada && horasRestantes < 0;
  const emRisco = !encerrada && !violado && horasRestantes < horas * 0.25;

  let tone: StatusTone = 'success';
  let rotulo = 'No prazo';
  if (encerrada) {
    tone = 'neutral';
    rotulo = 'Encerrada';
  } else if (violado) {
    tone = 'danger';
    rotulo = `SLA vencido ${formatHoras(-horasRestantes)}`;
  } else if (emRisco) {
    tone = 'pending';
    rotulo = `Vence em ${formatHoras(horasRestantes)}`;
  } else {
    rotulo = `Vence em ${formatHoras(horasRestantes)}`;
  }

  return {
    prazoISO: new Date(prazo).toISOString(),
    horasRestantes,
    violado,
    emRisco,
    tone,
    rotulo,
  };
}

/** Peso para ordenar ocorrências por urgência de SLA (maior = mais urgente). */
export function pesoSla(info: SlaInfo): number {
  if (info.violado) return 1000 - info.horasRestantes; // mais vencido primeiro
  if (info.tone === 'neutral') return -1000; // encerradas ao fim
  return 100 - info.horasRestantes; // menos horas restantes = mais urgente
}

function formatHoras(h: number): string {
  const abs = Math.abs(h);
  if (abs < 1) return `${Math.round(abs * 60)} min`;
  if (abs < 48) return `${Math.round(abs)} h`;
  return `${Math.round(abs / 24)} d`;
}

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const PRIORIDADE_TONE: Record<Prioridade, StatusTone> = {
  baixa: 'neutral',
  media: 'info',
  alta: 'pending',
  critica: 'danger',
};

/* ---------------------------- Lavanderia ------------------------------ */

export interface ExcedenteInfo {
  ciclosUsados: number;
  ciclosInclusos: number;
  ciclosExcedentes: number;
  valorExcedente: number;
  total: number;
}

export function calcularExcedenteLavanderia(
  ciclosUsados: number,
  rules: TenantRules,
): ExcedenteInfo {
  const inclusos = rules.lavanderiaCiclosInclusos;
  const excedentes = Math.max(0, ciclosUsados - inclusos);
  const total = excedentes * rules.lavanderiaValorExcedente;
  return {
    ciclosUsados,
    ciclosInclusos: inclusos,
    ciclosExcedentes: excedentes,
    valorExcedente: rules.lavanderiaValorExcedente,
    total,
  };
}

/* ------------------------------ Reservas ------------------------------ */

export function podeReservar(
  dataISO: string,
  rules: TenantRules,
  agora: number = Date.now(),
): { ok: boolean; motivo?: string } {
  const alvo = new Date(dataISO).getTime();
  const horasAte = (alvo - agora) / 3600_000;
  if (horasAte < 0) return { ok: false, motivo: 'Data já passou' };
  if (horasAte < rules.reservaAntecedenciaMinimaHoras) {
    return {
      ok: false,
      motivo: `Reserve com ${rules.reservaAntecedenciaMinimaHoras}h de antecedência`,
    };
  }
  return { ok: true };
}
