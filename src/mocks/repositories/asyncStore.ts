/**
 * Base da camada de repositório mock.
 *
 * Persiste coleções em AsyncStorage, namespaced por TENANT ativo — cada
 * condomínio mantém seu próprio estado de CRUD (NF-07). Toda tela consome
 * dados apenas por estas funções / pelas interfaces de repositório, nunca
 * importando JSON direto (NF-05).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTenantStore } from '@core/state/tenantStore';

function currentTenantId(): string {
  return useTenantStore.getState().activeTenantId;
}

function keyFor(domain: string): string {
  return `spl.data.${currentTenantId()}.${domain}`;
}

/** Pequena latência para dar sensação de I/O real. */
function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function loadCollection<T>(domain: string, seed: T[]): Promise<T[]> {
  const key = keyFor(domain);
  const raw = await AsyncStorage.getItem(key);
  if (raw) {
    try {
      return delay(JSON.parse(raw) as T[]);
    } catch {
      /* dados corrompidos — re-seed abaixo */
    }
  }
  await AsyncStorage.setItem(key, JSON.stringify(seed));
  return delay(seed);
}

export async function saveCollection<T>(domain: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(domain), JSON.stringify(items));
}

/** Reseta o estado mock de TODOS os tenants (usado no modo demonstração). */
export async function resetAllMockData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const mine = keys.filter((k) => k.startsWith('spl.data.'));
  if (mine.length) await AsyncStorage.multiRemove(mine);
}

/** Contrato base de leitura — todo repositório o satisfaz. */
export interface ReadRepository<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
}

/** Fábrica de repositório somente-leitura sobre uma coleção mock. */
export function createReadRepository<T extends { id: string }>(
  domain: string,
  seed: T[],
): ReadRepository<T> {
  return {
    async list() {
      return loadCollection(domain, seed);
    },
    async getById(id) {
      const items = await loadCollection(domain, seed);
      return items.find((i) => i.id === id) ?? null;
    },
  };
}
