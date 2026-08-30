import { useCallback, useEffect, useState } from 'react';
import { useTenantStore } from '@core/state/tenantStore';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: (updater: (prev: T | null) => T | null) => void;
}

/**
 * Executa uma função assíncrona de repositório. Re-executa quando o tenant
 * ativo muda (dados são isolados por condomínio) e quando `deps` mudam.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const tenantId = useTenantStore((s) => s.activeTenantId);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fn()
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e?.message ?? 'Erro ao carregar'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, nonce, ...deps]);

  const patch = useCallback((updater: (prev: T | null) => T | null) => {
    setData((prev) => updater(prev));
  }, []);

  return { data, loading, error, reload, setData: patch };
}
