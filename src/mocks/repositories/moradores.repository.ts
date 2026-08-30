/**
 * Repositório de Moradores/Dependentes — interface + implementação mock.
 * CRUD completo: cadastrar, editar e remover morador/inquilino/dependente.
 */
import { loadCollection, saveCollection } from './asyncStore';
import { makeId } from '@shared/utils/format';
import type { Morador, NovoMorador } from '@shared/types';
import seed from '../data/moradores.json';

const DOMAIN = 'moradores';
const SEED = seed as Morador[];

export interface MoradoresRepository {
  list(): Promise<Morador[]>;
  listByUnidade(unidadeId: string): Promise<Morador[]>;
  getById(id: string): Promise<Morador | null>;
  create(data: NovoMorador): Promise<Morador>;
  update(id: string, patch: Partial<Morador>): Promise<Morador>;
  remove(id: string): Promise<void>;
}

export class MockMoradoresRepository implements MoradoresRepository {
  async list(): Promise<Morador[]> {
    return loadCollection(DOMAIN, SEED);
  }

  async listByUnidade(unidadeId: string): Promise<Morador[]> {
    const all = await this.list();
    return all.filter((m) => m.unidadeId === unidadeId);
  }

  async getById(id: string): Promise<Morador | null> {
    const all = await this.list();
    return all.find((m) => m.id === id) ?? null;
  }

  async create(data: NovoMorador): Promise<Morador> {
    const all = await this.list();
    const novo: Morador = { id: makeId('mor'), ...data };
    await saveCollection(DOMAIN, [...all, novo]);
    return novo;
  }

  async update(id: string, patch: Partial<Morador>): Promise<Morador> {
    const all = await this.list();
    const next = all.map((m) => (m.id === id ? { ...m, ...patch } : m));
    await saveCollection(DOMAIN, next);
    return next.find((m) => m.id === id)!;
  }

  async remove(id: string): Promise<void> {
    const all = await this.list();
    await saveCollection(
      DOMAIN,
      all.filter((m) => m.id !== id),
    );
  }
}
