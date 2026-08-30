import React from 'react';
import { View } from 'react-native';
import { Wrench, MapPin, User } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, EmptyState } from '@core/design-system';
import { formatDate } from '@shared/utils/format';
import type { ManutencaoStatus, StatusTone } from '@shared/types';

const META: Record<ManutencaoStatus, { label: string; tone: StatusTone }> = {
  agendada: { label: 'Agendada', tone: 'info' },
  em_execucao: { label: 'Em execução', tone: 'pending' },
  concluida: { label: 'Concluída', tone: 'success' },
};

export default function Manutencao() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.manutencao.list());

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Manutenção" subtitle="Ordens de serviço" back icon={Wrench} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={Wrench} title="Sem ordens" message="Nenhuma manutenção agendada." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((o) => {
            const meta = META[o.status];
            return (
              <Card key={o.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <Text variant="subheading" style={{ flex: 1, marginRight: 8 }}>{o.titulo}</Text>
                  <StatusPill label={meta.label} tone={meta.tone} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <MapPin size={13} color={t.color.faint} />
                  <Text variant="caption" color="muted">{o.local}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <User size={13} color={t.color.faint} />
                  <Text variant="caption" color="muted">{o.responsavel} · {formatDate(o.agendadaPara)}</Text>
                </View>
              </Card>
            );
          })}
        </View>
      </Screen>
    </View>
  );
}
