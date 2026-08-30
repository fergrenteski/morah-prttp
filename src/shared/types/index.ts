/**
 * Tipos de domínio — entidades de negócio (NF-10: TS explícito ponta a ponta).
 * Todas as telas e repositórios consomem estes tipos.
 */
import type { StatusTone } from '@core/theme/tokens';

export type Role = 'sindico' | 'morador' | 'porteiro';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  unidadeId: string;
  unidadeLabel: string;
  avatarInitials: string;
}

/* ----------------------------- Financeiro ----------------------------- */
export type BoletoStatus = 'pago' | 'aberto' | 'vencido';
export interface Boleto {
  id: string;
  competencia: string; // "2026-08"
  descricao: string;
  valor: number;
  vencimento: string; // ISO date
  status: BoletoStatus;
  linhaDigitavel: string;
  unidadeId: string;
  itens: { rotulo: string; valor: number }[];
}

/* ------------------------------ Portaria ------------------------------ */
export type VisitanteStatus = 'esperado' | 'liberado' | 'no_predio' | 'saiu';
export interface Visitante {
  id: string;
  nome: string;
  documento: string;
  unidadeId: string;
  unidadeLabel: string;
  previsto: string; // ISO datetime
  status: VisitanteStatus;
  observacao?: string;
}

export type EncomendaStatus = 'recebida' | 'retirada';
export interface Encomenda {
  id: string;
  transportadora: string;
  codigo: string;
  unidadeId: string;
  unidadeLabel: string;
  recebidaEm: string; // ISO datetime
  status: EncomendaStatus;
  retiradaPor?: string;
}

/* ------------------------------ Reservas ------------------------------ */
export interface AreaComum {
  id: string;
  nome: string;
  capacidade: number;
  horarios: string[]; // ["08:00-12:00", ...]
  requerAtestado?: boolean;
}
export type ReservaStatus = 'confirmada' | 'pendente' | 'cancelada';
export interface Reserva {
  id: string;
  areaId: string;
  areaNome: string;
  data: string; // ISO date
  horario: string;
  status: ReservaStatus;
  unidadeId: string;
  solicitante: string;
  convidados: number;
}

/* ----------------------------- Comunicados ---------------------------- */
export type ComunicadoTipo = 'aviso' | 'urgente' | 'evento' | 'manutencao';
export interface Comunicado {
  id: string;
  titulo: string;
  corpo: string;
  tipo: ComunicadoTipo;
  autor: string;
  publicadoEm: string; // ISO datetime
  fixado: boolean;
}

/* ----------------------------- Ocorrências ---------------------------- */
export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';
export type OcorrenciaStatus = 'aberta' | 'em_andamento' | 'resolvida' | 'encerrada';
export interface ComentarioOcorrencia {
  id: string;
  autor: string;
  texto: string;
  em: string; // ISO datetime
}
export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: Prioridade;
  status: OcorrenciaStatus;
  abertaEm: string; // ISO datetime
  unidadeId: string;
  autor: string;
  comentarios: ComentarioOcorrencia[];
}
export interface NovaOcorrencia {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: Prioridade;
  unidadeId: string;
  autor: string;
}

/* ----------------------------- Assembleia ----------------------------- */
export type VotoOpcao = 'sim' | 'nao' | 'abstencao';
export interface Enquete {
  id: string;
  titulo: string;
  descricao: string;
  encerraEm: string; // ISO datetime
  aberta: boolean;
  votos: Record<VotoOpcao, number>;
  meuVoto?: VotoOpcao;
}

/* ------------------------------ Moradores ----------------------------- */
export type TipoMorador = 'proprietario' | 'inquilino' | 'dependente';
export interface Morador {
  id: string;
  nome: string;
  tipo: TipoMorador;
  documento: string;
  telefone: string;
  unidadeId: string;
  unidadeLabel: string;
  responsavelId?: string; // para dependentes
}
export interface NovoMorador {
  nome: string;
  tipo: TipoMorador;
  documento: string;
  telefone: string;
  unidadeId: string;
  unidadeLabel: string;
}

/* ------------------------------ Documentos ---------------------------- */
export type DocumentoCategoria = 'convencao' | 'ata' | 'balancete' | 'regulamento';
export interface Documento {
  id: string;
  titulo: string;
  categoria: DocumentoCategoria;
  atualizadoEm: string; // ISO date
  tamanho: string; // "1.2 MB"
}

/* -------------------------------- Pets -------------------------------- */
export interface Vacina {
  nome: string;
  aplicadaEm: string;
  validade: string;
}
export interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  porte: 'pequeno' | 'medio' | 'grande';
  unidadeId: string;
  vacinas: Vacina[];
}

/* -------------------------- Marketplace/Desapego ---------------------- */
export type ItemStatus = 'ativo' | 'reservado' | 'vendido' | 'em_moderacao';
export interface ItemDesapego {
  id: string;
  titulo: string;
  descricao: string;
  preco: number; // 0 = doação
  categoria: string;
  vendedor: string;
  unidadeLabel: string;
  status: ItemStatus;
  publicadoEm: string;
}

/* ------------------------------ Lavanderia ---------------------------- */
export interface CicloLavanderia {
  id: string;
  unidadeId: string;
  maquina: string;
  iniciadoEm: string;
  duracaoMin: number;
  concluido: boolean;
}

/* -------------------------------- Piscina ----------------------------- */
export type AtestadoStatus = 'valido' | 'vencido' | 'ausente';
export interface AcessoPiscina {
  moradorId: string;
  moradorNome: string;
  unidadeLabel: string;
  atestadoStatus: AtestadoStatus;
  atestadoValidade?: string;
  liberado: boolean;
}

/* ------------------------------- Veículos ----------------------------- */
export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  unidadeLabel: string;
  tag: string;
  tagAtiva: boolean;
}

/* ------------------------------ Prestadores --------------------------- */
export interface Prestador {
  id: string;
  nome: string;
  servico: string;
  contrato: string;
  vigenciaAte: string;
  avaliacao: number; // 0-5
}

/* -------------------------------- Garagem ----------------------------- */
export type VagaStatus = 'disponivel' | 'reservada' | 'ocupada';
export interface VagaGaragem {
  id: string;
  codigo: string;
  bloco: string;
  empresa?: string;
  precoHora: number;
  status: VagaStatus;
  anuncianteUnidade: string;
}

/* ----------------------------- Funcionários --------------------------- */
export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  turno: string;
  admissao: string;
}

/* ------------------------------ Manutenção ---------------------------- */
export type ManutencaoStatus = 'agendada' | 'em_execucao' | 'concluida';
export interface OrdemManutencao {
  id: string;
  titulo: string;
  local: string;
  responsavel: string;
  status: ManutencaoStatus;
  agendadaPara: string;
}

/* --------------------------- Helpers de status ------------------------ */
export type { StatusTone };
