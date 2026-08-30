import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  StatusPill,
  Chip,
  EmptyState,
} from '@core/design-system';
import { formatBRL, formatCompetencia, formatDate } from '@shared/utils/format';
import type { BoletoStatus, StatusTone } from '@shared/types';

const STATUS_META: Record<BoletoStatus, { label: string; tone: StatusTone }> = {
  pago: { label: 'Pago', tone: 'success' },
  aberto: { label: 'Em aberto', tone: 'pending' },
  vencido: { label: 'Vencido', tone: 'danger' },
};

type Filtro = 'todos' | 'aberto' | 'pago';

export default function Financeiro() {
  const t = useTheme();
  const router = useRouter();
  const repo = useRepositories();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const { data, loading, reload } = useAsync(() => repo.financeiro.list());

  const boletos = data ?? [];
  const totalAberto = boletos
    .filter((b) => b.status !== 'pago')
    .reduce((s, b) => s + b.valor, 0);

  const visiveis = boletos.filter((b) => {
    if (filtro === 'todos') return true;
    if (filtro === 'pago') return b.status === 'pago';
    return b.status !== 'pago';
  });

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Financeiro" subtitle="Boletos e 2ª via" icon={Receipt} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <Card tone="tint" accent>
          <Text variant="overline" color="brand">Total em aberto</Text>
          <Text mono style={{ fontSize: t.fontSize['3xl'], lineHeight: t.fontSize['3xl'] * 1.15, color: t.brand.primaryStrong, marginTop: 4 }}>
            {formatBRL(totalAberto)}
          </Text>
          <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
            Unidade {boletos[0]?.unidadeId ?? '—'} · atualizado agora
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.lg }}>
          {(['todos', 'aberto', 'pago'] as Filtro[]).map((f) => (
            <Chip
              key={f}
              label={f === 'todos' ? 'Todos' : f === 'aberto' ? 'Em aberto' : 'Pagos'}
              selected={filtro === f}
              onPress={() => setFiltro(f)}
            />
          ))}
        </View>

        <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
          {visiveis.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <Card key={b.id} onPress={() => router.push(`/boleto/${b.id}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" color="muted">{formatCompetencia(b.competencia)}</Text>
                    <Text variant="subheading" style={{ marginTop: 2 }}>{b.descricao}</Text>
                    <Text variant="caption" color="muted" style={{ marginTop: 4 }}>
                      Vence em {formatDate(b.vencimento)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text mono variant="subheading">{formatBRL(b.valor)}</Text>
                    <StatusPill label={meta.label} tone={meta.tone} />
                  </View>
                  <ChevronRight size={18} color={t.color.faint} style={{ marginLeft: 8 }} />
                </View>
              </Card>
            );
          })}
          {!loading && visiveis.length === 0 && (
            <EmptyState icon={Receipt} title="Nenhum boleto" message="Não há boletos para este filtro." />
          )}
        </View>
      </Screen>
    </View>
  );
}
