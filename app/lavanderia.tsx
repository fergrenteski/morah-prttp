import React from 'react';
import { View } from 'react-native';
import { WashingMachine, Plus } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, Stat, Button, DataRow, Divider, EmptyState } from '@core/design-system';
import { formatBRL, formatDateTime } from '@shared/utils/format';
import { calcularExcedenteLavanderia } from '@shared/rules';

export default function Lavanderia() {
  const t = useTheme();
  const { rules } = useTenant();
  const { user } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.lavanderia.list());

  const ciclos = data ?? [];
  const excedente = calcularExcedenteLavanderia(ciclos.length, rules);

  async function registrar() {
    await repo.lavanderia.registrarCiclo(user?.unidadeId ?? 'un-0803', 'Lavadora 01');
    reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Lavanderia" subtitle="Ciclos e cobrança de excedente" back icon={WashingMachine} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <Stat value={String(excedente.ciclosUsados)} label="ciclos no mês" />
          <Stat value={String(excedente.ciclosInclusos)} label="inclusos no plano" />
          <Stat
            value={String(excedente.ciclosExcedentes)}
            label="excedentes"
            tone={excedente.ciclosExcedentes > 0 ? 'pending' : 'success'}
          />
        </View>

        <Card tone="tint" accent style={{ marginTop: t.spacing.lg }}>
          <Text variant="overline" color="brand">Cobrança de excedente</Text>
          <Text mono style={{ fontSize: t.fontSize['3xl'], lineHeight: t.fontSize['3xl'] * 1.15, color: t.brand.primaryStrong, marginTop: 4 }}>
            {formatBRL(excedente.total)}
          </Text>
          <Divider spacing={t.spacing.md} />
          <DataRow label="Ciclos excedentes" value={String(excedente.ciclosExcedentes)} mono />
          <DataRow label="Valor por ciclo extra" value={formatBRL(excedente.valorExcedente)} mono />
          <Text variant="caption" color="muted" style={{ marginTop: t.spacing.sm }}>
            {excedente.ciclosInclusos} ciclos inclusos · excedente lançado no próximo boleto.
          </Text>
        </Card>

        <Button label="Registrar novo ciclo" icon={Plus} variant="outline" fullWidth style={{ marginTop: t.spacing.lg }} onPress={registrar} />

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Histórico de ciclos
        </Text>
        {ciclos.length === 0 && !loading && (
          <EmptyState icon={WashingMachine} title="Sem ciclos" message="Nenhum ciclo registrado." />
        )}
        <Card>
          {ciclos.map((c, i) => (
            <View key={c.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: t.spacing.sm }}>
                <View>
                  <Text variant="label">{c.maquina}</Text>
                  <Text variant="caption" color="faint">{formatDateTime(c.iniciadoEm)} · {c.duracaoMin} min</Text>
                </View>
                <Text mono variant="caption" color={i < excedente.ciclosInclusos ? 'muted' : 'brand'}>
                  {i < excedente.ciclosInclusos ? 'incluso' : `+${formatBRL(excedente.valorExcedente)}`}
                </Text>
              </View>
              {i < ciclos.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      </Screen>
    </View>
  );
}
