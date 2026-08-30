import React from 'react';
import { View } from 'react-native';
import { PawPrint, Syringe } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, Divider, EmptyState } from '@core/design-system';
import { formatDate } from '@shared/utils/format';

const HOJE = new Date();

export default function Pets() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.pets.list());

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Pets" subtitle="Carteira de vacinação" back icon={PawPrint} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={PawPrint} title="Nenhum pet" message="Cadastre os pets da sua unidade." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((p) => (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.brand.tint, alignItems: 'center', justifyContent: 'center' }}>
                  <PawPrint size={24} color={t.brand.primaryStrong} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{p.nome}</Text>
                  <Text variant="caption" color="muted">{p.especie} · {p.raca} · porte {p.porte}</Text>
                </View>
              </View>
              <Divider spacing={t.spacing.md} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.spacing.sm }}>
                <Syringe size={14} color={t.color.muted} />
                <Text variant="overline" color="muted">Vacinas</Text>
              </View>
              <View style={{ gap: t.spacing.sm }}>
                {p.vacinas.map((v) => {
                  const vigente = new Date(v.validade) >= HOJE;
                  return (
                    <View key={v.nome} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text variant="label">{v.nome}</Text>
                        <Text variant="caption" color="faint">Validade {formatDate(v.validade)}</Text>
                      </View>
                      <StatusPill label={vigente ? 'Em dia' : 'Vencida'} tone={vigente ? 'success' : 'danger'} />
                    </View>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}
