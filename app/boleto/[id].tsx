import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Receipt, Copy, Download, CircleCheck } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  Button,
  StatusPill,
  DataRow,
  Divider,
} from '@core/design-system';
import { formatBRL, formatCompetencia, formatDate } from '@shared/utils/format';
import type { BoletoStatus, StatusTone } from '@shared/types';

const META: Record<BoletoStatus, { label: string; tone: StatusTone }> = {
  pago: { label: 'Pago', tone: 'success' },
  aberto: { label: 'Em aberto', tone: 'pending' },
  vencido: { label: 'Vencido', tone: 'danger' },
};

export default function BoletoDetalhe() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const repo = useRepositories();
  const [copiado, setCopiado] = useState(false);
  const { data: boleto, loading } = useAsync(() => repo.financeiro.getById(String(id)), [id]);

  function copiarLinha() {
    if (!boleto) return;
    // Protótipo: apenas feedback visual (sem dependência de clipboard nativo).
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (loading || !boleto) {
    return (
      <View style={{ flex: 1 }}>
        <BrandHeader title="Boleto" back icon={Receipt} />
        <Screen edgeTop={false} />
      </View>
    );
  }

  const meta = META[boleto.status];

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title={formatCompetencia(boleto.competencia)} subtitle={boleto.descricao} back />
      <Screen edgeTop={false}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text variant="overline" color="muted">Valor total</Text>
              <Text mono style={{ fontSize: t.fontSize['3xl'], lineHeight: t.fontSize['3xl'] * 1.15, color: t.color.ink, marginTop: 4 }}>
                {formatBRL(boleto.valor)}
              </Text>
            </View>
            <StatusPill label={meta.label} tone={meta.tone} />
          </View>
          <Divider spacing={t.spacing.md} />
          <DataRow label="Vencimento" value={formatDate(boleto.vencimento)} />
          <DataRow label="Competência" value={formatCompetencia(boleto.competencia)} />
          <DataRow label="Unidade" value={boleto.unidadeId} mono />
        </Card>

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Composição
        </Text>
        <Card>
          {boleto.itens.map((it, i) => (
            <View key={it.rotulo}>
              <DataRow label={it.rotulo} value={formatBRL(it.valor)} mono />
              {i < boleto.itens.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Linha digitável
        </Text>
        <Card tone="inset">
          <Text mono variant="label" style={{ color: t.color.inkSoft, lineHeight: 22 }} selectable>
            {boleto.linhaDigitavel}
          </Text>
        </Card>

        <View style={{ gap: t.spacing.md, marginTop: t.spacing.xl }}>
          {boleto.status !== 'pago' && (
            <Button
              label={copiado ? 'Linha copiada!' : 'Copiar linha digitável'}
              icon={copiado ? CircleCheck : Copy}
              onPress={copiarLinha}
              fullWidth
            />
          )}
          <Button
            label="Baixar 2ª via (PDF)"
            icon={Download}
            variant="outline"
            fullWidth
            onPress={() =>
              Alert.alert('2ª via', 'Em um app real, o PDF do boleto seria gerado aqui.')
            }
          />
        </View>
      </Screen>
    </View>
  );
}
