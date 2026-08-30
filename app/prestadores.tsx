import React from 'react';
import { View } from 'react-native';
import { HardHat, Star, FileText, CalendarClock } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, Divider, EmptyState } from '@core/design-system';
import { formatDate } from '@shared/utils/format';

function Estrelas({ nota }: { nota: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={15}
            color={i <= Math.round(nota) ? '#D97706' : t.color.line}
            fill={i <= Math.round(nota) ? '#F59E0B' : 'transparent'}
            strokeWidth={2}
          />
        ))}
      </View>
      <Text mono variant="caption" color="muted">{nota.toFixed(1)}</Text>
    </View>
  );
}

export default function Prestadores() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.prestadores.list());

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Prestadores" subtitle="Contratos e avaliações" back icon={HardHat} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={HardHat} title="Sem prestadores" message="Nenhum contrato ativo." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((p) => (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text variant="subheading">{p.nome}</Text>
                  <Text variant="caption" color="muted">{p.servico}</Text>
                </View>
                <Estrelas nota={p.avaliacao} />
              </View>
              <Divider spacing={t.spacing.md} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileText size={13} color={t.color.faint} />
                <Text mono variant="caption" color="muted">{p.contrato}</Text>
                <CalendarClock size={13} color={t.color.faint} style={{ marginLeft: t.spacing.md }} />
                <Text variant="caption" color="muted">até {formatDate(p.vigenciaAte)}</Text>
              </View>
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}
