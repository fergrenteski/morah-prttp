import React from 'react';
import { View } from 'react-native';
import { Car } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, DataRow, Divider, EmptyState } from '@core/design-system';

export default function Veiculos() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.veiculos.list());

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Veículos" subtitle="Cadastro e tags de acesso" back icon={Car} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={Car} title="Sem veículos" message="Nenhum veículo cadastrado." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((v) => (
            <Card key={v.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <View style={{ width: 48, height: 48, borderRadius: t.radius.md, backgroundColor: t.brand.tint, alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={22} color={t.brand.primaryStrong} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{v.modelo}</Text>
                  <Text variant="caption" color="muted">{v.cor} · {v.unidadeLabel}</Text>
                </View>
                <View style={{ backgroundColor: t.color.ink, borderRadius: t.radius.sm, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text mono style={{ color: '#FFFFFF', fontSize: t.fontSize.sm, letterSpacing: 1 }}>{v.placa}</Text>
                </View>
              </View>
              <Divider spacing={t.spacing.md} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="label" color="muted">Tag</Text>
                  <Text mono variant="label">{v.tag}</Text>
                </View>
                <StatusPill label={v.tagAtiva ? 'Tag ativa' : 'Tag inativa'} tone={v.tagAtiva ? 'success' : 'neutral'} />
              </View>
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}
