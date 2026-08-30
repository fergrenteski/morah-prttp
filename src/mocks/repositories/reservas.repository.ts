/**
 * Repositório de Reservas de área comum — interface + implementação mock.
 * CRUD completo: criar, listar, ver disponibilidade e cancelar.
 */
import { loadCollection, saveCollection } from './asyncStore';
import { makeId } from '@shared/utils/format';
import type { AreaComum, Reserva } from '@shared/types';
import areasSeed from '../data/areas.json';
import reservasSeed from '../data/reservas.json';

const DOMAIN = 'reservas';
const AREAS = areasSeed as AreaComum[];
const SEED = reservasSeed as Reserva[];

export interface NovaReservaInput {
  areaId: string;
  data: string;
  horario: string;
  unidadeId: string;
  solicitante: string;
  convidados: number;
}

export interface ReservasRepository {
  listAreas(): Promise<AreaComum[]>;
  list(): Promise<Reserva[]>;
  getById(id: string): Promise<Reserva | null>;
  /** Horários já ocupados de uma área numa data (para disponibilidade). */
  horariosOcupados(areaId: string, data: string): Promise<string[]>;
  create(input: NovaReservaInput): Promise<Reserva>;
  setStatus(id: string, status: Reserva['status']): Promise<void>;
  cancel(id: string): Promise<void>;
}

export class MockReservasRepository implements ReservasRepository {
  async listAreas(): Promise<AreaComum[]> {
    return AREAS;
  }

  async list(): Promise<Reserva[]> {
    return loadCollection(DOMAIN, SEED);
  }

  async getById(id: string): Promise<Reserva | null> {
    const all = await this.list();
    return all.find((r) => r.id === id) ?? null;
  }

  async horariosOcupados(areaId: string, data: string): Promise<string[]> {
    const all = await this.list();
    return all
      .filter((r) => r.areaId === areaId && r.data === data && r.status !== 'cancelada')
      .map((r) => r.horario);
  }

  async create(input: NovaReservaInput): Promise<Reserva> {
    const all = await this.list();
    const area = AREAS.find((a) => a.id === input.areaId);
    const nova: Reserva = {
      id: makeId('res'),
      areaId: input.areaId,
      areaNome: area?.nome ?? 'Área comum',
      data: input.data,
      horario: input.horario,
      status: 'confirmada',
      unidadeId: input.unidadeId,
      solicitante: input.solicitante,
      convidados: input.convidados,
    };
    await saveCollection(DOMAIN, [nova, ...all]);
    return nova;
  }

  async setStatus(id: string, status: Reserva['status']): Promise<void> {
    const all = await this.list();
    await saveCollection(
      DOMAIN,
      all.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  async cancel(id: string): Promise<void> {
    return this.setStatus(id, 'cancelada');
  }
}
