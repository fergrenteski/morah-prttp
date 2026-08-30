/**
 * Provedor de repositórios (ativo reutilizável nº 3).
 *
 * Ponto único onde as telas obtêm acesso a dados. Todos os repositórios — CRUD
 * ou somente-leitura — expõem a mesma forma de contrato. Cada repositório lê o
 * TENANT ativo em tempo de chamada, então os dados são isolados por condomínio.
 */
import { loadCollection, saveCollection, createReadRepository } from './asyncStore';
import { makeId } from '@shared/utils/format';
import { MockOcorrenciasRepository } from './ocorrencias.repository';
import { MockReservasRepository } from './reservas.repository';
import { MockMoradoresRepository } from './moradores.repository';
import type {
  Boleto,
  Visitante,
  VisitanteStatus,
  Encomenda,
  Comunicado,
  Enquete,
  VotoOpcao,
  Documento,
  Pet,
  ItemDesapego,
  ItemStatus,
  CicloLavanderia,
  AcessoPiscina,
  Veiculo,
  Prestador,
  VagaGaragem,
  Funcionario,
  OrdemManutencao,
} from '@shared/types';

import boletos from '../data/boletos.json';
import visitantes from '../data/visitantes.json';
import encomendas from '../data/encomendas.json';
import comunicados from '../data/comunicados.json';
import enquetes from '../data/enquetes.json';
import documentos from '../data/documentos.json';
import pets from '../data/pets.json';
import marketplace from '../data/marketplace.json';
import lavanderia from '../data/lavanderia.json';
import piscina from '../data/piscina.json';
import veiculos from '../data/veiculos.json';
import prestadores from '../data/prestadores.json';
import garagem from '../data/garagem.json';
import funcionarios from '../data/funcionarios.json';
import manutencao from '../data/manutencao.json';

/* ------------------------- Portaria (leitura + escrita) ------------------ */
const portariaRepository = {
  async listVisitantes(): Promise<Visitante[]> {
    return loadCollection('visitantes', visitantes as Visitante[]);
  },
  async createVisitante(
    v: Omit<Visitante, 'id' | 'status'> & { status?: VisitanteStatus },
  ): Promise<Visitante> {
    const all = await this.listVisitantes();
    const novo: Visitante = { id: makeId('vis'), status: 'esperado', ...v };
    await saveCollection('visitantes', [novo, ...all]);
    return novo;
  },
  async setVisitanteStatus(id: string, status: VisitanteStatus): Promise<void> {
    const all = await this.listVisitantes();
    await saveCollection(
      'visitantes',
      all.map((v) => (v.id === id ? { ...v, status } : v)),
    );
  },
  async listEncomendas(): Promise<Encomenda[]> {
    return loadCollection('encomendas', encomendas as Encomenda[]);
  },
  async retirarEncomenda(id: string, retiradaPor: string): Promise<void> {
    const all = await this.listEncomendas();
    await saveCollection(
      'encomendas',
      all.map((e) =>
        e.id === id ? { ...e, status: 'retirada' as const, retiradaPor } : e,
      ),
    );
  },
};

/* --------------------------- Comunicados -------------------------------- */
const comunicadosRepository = {
  async list(): Promise<Comunicado[]> {
    return loadCollection('comunicados', comunicados as Comunicado[]);
  },
  async publish(
    data: Pick<Comunicado, 'titulo' | 'corpo' | 'tipo' | 'autor'>,
  ): Promise<Comunicado> {
    const all = await this.list();
    const novo: Comunicado = {
      id: makeId('com'),
      ...data,
      publicadoEm: new Date().toISOString(),
      fixado: false,
    };
    await saveCollection('comunicados', [novo, ...all]);
    return novo;
  },
};

/* --------------------------- Assembleia --------------------------------- */
const assembleiaRepository = {
  async list(): Promise<Enquete[]> {
    return loadCollection('enquetes', enquetes as Enquete[]);
  },
  async votar(id: string, opcao: VotoOpcao): Promise<Enquete> {
    const all = await this.list();
    const next = all.map((e) => {
      if (e.id !== id || !e.aberta || e.meuVoto) return e;
      return {
        ...e,
        meuVoto: opcao,
        votos: { ...e.votos, [opcao]: e.votos[opcao] + 1 },
      };
    });
    await saveCollection('enquetes', next);
    return next.find((e) => e.id === id)!;
  },
};

/* --------------------------- Marketplace -------------------------------- */
const marketplaceRepository = {
  async list(): Promise<ItemDesapego[]> {
    return loadCollection('marketplace', marketplace as ItemDesapego[]);
  },
  async setStatus(id: string, status: ItemStatus): Promise<void> {
    const all = await this.list();
    await saveCollection(
      'marketplace',
      all.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  },
  /** Moderação pelo síndico: aprovar publica (ativo) ou reprovar (remove). */
  async moderar(id: string, aprovar: boolean): Promise<void> {
    if (aprovar) return this.setStatus(id, 'ativo');
    const all = await this.list();
    await saveCollection(
      'marketplace',
      all.filter((i) => i.id !== id),
    );
  },
};

/* --------------------------- Piscina ------------------------------------ */
const piscinaRepository = {
  async list(): Promise<AcessoPiscina[]> {
    return loadCollection('piscina', piscina as AcessoPiscina[]);
  },
  async setLiberado(moradorId: string, liberado: boolean): Promise<void> {
    const all = await this.list();
    await saveCollection(
      'piscina',
      all.map((a) => (a.moradorId === moradorId ? { ...a, liberado } : a)),
    );
  },
};

/* --------------------------- Lavanderia --------------------------------- */
const lavanderiaRepository = {
  async list(): Promise<CicloLavanderia[]> {
    return loadCollection('lavanderia', lavanderia as CicloLavanderia[]);
  },
  async registrarCiclo(unidadeId: string, maquina: string): Promise<CicloLavanderia> {
    const all = await this.list();
    const ciclo: CicloLavanderia = {
      id: makeId('lav'),
      unidadeId,
      maquina,
      iniciadoEm: new Date().toISOString(),
      duracaoMin: 45,
      concluido: false,
    };
    await saveCollection('lavanderia', [ciclo, ...all]);
    return ciclo;
  },
};

/* ------------------- Repositórios somente-leitura ----------------------- */
export const repositories = {
  ocorrencias: new MockOcorrenciasRepository(),
  reservas: new MockReservasRepository(),
  moradores: new MockMoradoresRepository(),
  portaria: portariaRepository,
  comunicados: comunicadosRepository,
  assembleia: assembleiaRepository,
  marketplace: marketplaceRepository,
  piscina: piscinaRepository,
  lavanderia: lavanderiaRepository,
  financeiro: createReadRepository<Boleto>('boletos', boletos as Boleto[]),
  documentos: createReadRepository<Documento>('documentos', documentos as Documento[]),
  pets: createReadRepository<Pet>('pets', pets as Pet[]),
  veiculos: createReadRepository<Veiculo>('veiculos', veiculos as Veiculo[]),
  prestadores: createReadRepository<Prestador>('prestadores', prestadores as Prestador[]),
  garagem: createReadRepository<VagaGaragem>('garagem', garagem as VagaGaragem[]),
  funcionarios: createReadRepository<Funcionario>('funcionarios', funcionarios as Funcionario[]),
  manutencao: createReadRepository<OrdemManutencao>('manutencao', manutencao as OrdemManutencao[]),
};

export type Repositories = typeof repositories;

/** Hook de acesso — mantém a mesma porta de entrada em toda a app. */
export function useRepositories(): Repositories {
  return repositories;
}
