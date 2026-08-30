import React from 'react';
import { View } from 'react-native';
import { UserCog, Clock } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, Avatar, EmptyState } from '@core/design-system';
import { formatDate, initialsOf } from '@shared/utils/format';

export default function Funcionarios() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.funcionarios.list());

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Funcionários" subtitle="Equipe do condomínio" back icon={UserCog} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={UserCog} title="Sem funcionários" message="Nenhum colaborador cadastrado." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((f) => (
            <Card key={f.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Avatar initials={initialsOf(f.nome)} size={44} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{f.nome}</Text>
                  <Text variant="caption" color="muted">{f.cargo}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Clock size={12} color={t.color.faint} />
                    <Text variant="caption" color="faint">{f.turno} · desde {formatDate(f.admissao)}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}
