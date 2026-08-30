/**
 * Repositório de Ocorrências — interface abstrata + implementação mock.
 *
 * Ativo reutilizável nº 3: no dia em que houver backend real, troca-se só a
 * classe de implementação; nenhuma tela muda (NF-05).
 */
import { loadCollection, saveCollection } from './asyncStore';
import { makeId } from '@shared/utils/format';
import type { Ocorrencia, NovaOcorrencia, ComentarioOcorrencia } from '@shared/types';
import seed from '../data/ocorrencias.json';

const DOMAIN = 'ocorrencias';
const SEED = seed as Ocorrencia[];

export interface OcorrenciasRepository {
  list(): Promise<Ocorrencia[]>;
  getById(id: string): Promise<Ocorrencia | null>;
  create(data: NovaOcorrencia): Promise<Ocorrencia>;
  update(id: string, patch: Partial<Ocorrencia>): Promise<Ocorrencia>;
  comentar(id: string, autor: string, texto: string): Promise<Ocorrencia>;
  close(id: string): Promise<void>;
}

export class MockOcorrenciasRepository implements OcorrenciasRepository {
  async list(): Promise<Ocorrencia[]> {
    return loadCollection(DOMAIN, SEED);
  }

  async getById(id: string): Promise<Ocorrencia | null> {
    const all = await this.list();
    return all.find((o) => o.id === id) ?? null;
  }

  async create(data: NovaOcorrencia): Promise<Ocorrencia> {
    const all = await this.list();
    const nova: Ocorrencia = {
      id: makeId('oco'),
      ...data,
      status: 'aberta',
      abertaEm: new Date().toISOString(),
      comentarios: [],
    };
    const next = [nova, ...all];
    await saveCollection(DOMAIN, next);
    return nova;
  }

  async update(id: string, patch: Partial<Ocorrencia>): Promise<Ocorrencia> {
    const all = await this.list();
    const next = all.map((o) => (o.id === id ? { ...o, ...patch } : o));
    await saveCollection(DOMAIN, next);
    return next.find((o) => o.id === id)!;
  }

  async comentar(id: string, autor: string, texto: string): Promise<Ocorrencia> {
    const all = await this.list();
    const comentario: ComentarioOcorrencia = {
      id: makeId('cmt'),
      autor,
      texto,
      em: new Date().toISOString(),
    };
    const next = all.map((o) =>
      o.id === id
        ? {
            ...o,
            comentarios: [...o.comentarios, comentario],
            status: o.status === 'aberta' ? 'em_andamento' : o.status,
          }
        : o,
    );
    await saveCollection(DOMAIN, next);
    return next.find((o) => o.id === id)!;
  }

  async close(id: string): Promise<void> {
    const all = await this.list();
    const next = all.map((o) =>
      o.id === id ? { ...o, status: 'encerrada' as const } : o,
    );
    await saveCollection(DOMAIN, next);
  }
}
