import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { DoorOpen, Package, Check, LogIn, LogOut } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  StatusPill,
  SegmentedControl,
  Button,
  Fab,
  BottomSheet,
  Input,
  EmptyState,
  Divider,
} from '@core/design-system';
import { formatDateTime } from '@shared/utils/format';
import type { VisitanteStatus, StatusTone } from '@shared/types';

const VIS_META: Record<VisitanteStatus, { label: string; tone: StatusTone }> = {
  esperado: { label: 'Esperado', tone: 'pending' },
  liberado: { label: 'Liberado', tone: 'approved' },
  no_predio: { label: 'No prédio', tone: 'info' },
  saiu: { label: 'Saiu', tone: 'neutral' },
};

type Aba = 'visitantes' | 'encomendas';

export default function Portaria() {
  const t = useTheme();
  const repo = useRepositories();
  const [aba, setAba] = useState<Aba>('visitantes');

  const visitantes = useAsync(() => repo.portaria.listVisitantes());
  const encomendas = useAsync(() => repo.portaria.listEncomendas());

  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [unidade, setUnidade] = useState('');

  async function salvarVisitante() {
    if (!nome.trim() || !unidade.trim()) {
      Alert.alert('Dados incompletos', 'Informe o nome e a unidade de destino.');
      return;
    }
    await repo.portaria.createVisitante({
      nome: nome.trim(),
      documento: documento.trim() || 'Não informado',
      unidadeId: 'un-manual',
      unidadeLabel: unidade.trim(),
      previsto: new Date().toISOString(),
    });
    setNome('');
    setDocumento('');
    setUnidade('');
    setOpen(false);
    visitantes.reload();
  }

  async function avancarVisitante(id: string, atual: VisitanteStatus) {
    const proximo: VisitanteStatus =
      atual === 'esperado' ? 'no_predio' : atual === 'no_predio' ? 'saiu' : 'saiu';
    await repo.portaria.setVisitanteStatus(id, proximo);
    visitantes.reload();
  }

  async function retirar(id: string) {
    await repo.portaria.retirarEncomenda(id, 'Retirado na portaria');
    encomendas.reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Portaria" subtitle="Visitantes e encomendas" icon={DoorOpen} />
      <Screen edgeTop={false} refreshing={visitantes.loading || encomendas.loading} onRefresh={() => { visitantes.reload(); encomendas.reload(); }}>
        <SegmentedControl
          segments={[
            { value: 'visitantes', label: 'Visitantes' },
            { value: 'encomendas', label: 'Encomendas' },
          ]}
          value={aba}
          onChange={setAba}
        />

        {aba === 'visitantes' && (
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {(visitantes.data ?? []).map((v) => {
              const meta = VIS_META[v.status];
              return (
                <Card key={v.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="subheading">{v.nome}</Text>
                      <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                        {v.unidadeLabel} · {v.documento}
                      </Text>
                      <Text variant="caption" color="faint" style={{ marginTop: 2 }}>
                        Previsto: {formatDateTime(v.previsto)}
                      </Text>
                    </View>
                    <StatusPill label={meta.label} tone={meta.tone} />
                  </View>
                  {v.status !== 'saiu' && (
                    <>
                      <Divider spacing={t.spacing.md} />
                      <Button
                        label={v.status === 'esperado' ? 'Registrar entrada' : 'Registrar saída'}
                        icon={v.status === 'esperado' ? LogIn : LogOut}
                        variant="secondary"
                        size="sm"
                        onPress={() => avancarVisitante(v.id, v.status)}
                      />
                    </>
                  )}
                </Card>
              );
            })}
            {(visitantes.data?.length ?? 0) === 0 && (
              <EmptyState icon={DoorOpen} title="Sem visitantes" message="Nenhum visitante registrado." />
            )}
          </View>
        )}

        {aba === 'encomendas' && (
          <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
            {(encomendas.data ?? []).map((e) => (
              <Card key={e.id}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{e.transportadora}</Text>
                    <Text mono variant="caption" color="muted" style={{ marginTop: 2 }}>{e.codigo}</Text>
                    <Text variant="caption" color="faint" style={{ marginTop: 2 }}>
                      {e.unidadeLabel} · recebida {formatDateTime(e.recebidaEm)}
                    </Text>
                  </View>
                  <StatusPill
                    label={e.status === 'recebida' ? 'Aguardando' : 'Retirada'}
                    tone={e.status === 'recebida' ? 'pending' : 'success'}
                  />
                </View>
                {e.status === 'recebida' ? (
                  <>
                    <Divider spacing={t.spacing.md} />
                    <Button label="Registrar retirada" icon={Check} variant="secondary" size="sm" onPress={() => retirar(e.id)} />
                  </>
                ) : (
                  e.retiradaPor && (
                    <Text variant="caption" color="muted" style={{ marginTop: t.spacing.sm }}>
                      Retirado por {e.retiradaPor}
                    </Text>
                  )
                )}
              </Card>
            ))}
            {(encomendas.data?.length ?? 0) === 0 && (
              <EmptyState icon={Package} title="Sem encomendas" message="Nenhuma encomenda registrada." />
            )}
          </View>
        )}
      </Screen>

      {aba === 'visitantes' && <Fab label="Novo visitante" onPress={() => setOpen(true)} />}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Registrar visitante"
        subtitle="Visitante esperado na portaria"
        footer={<Button label="Registrar" icon={Check} fullWidth onPress={salvarVisitante} />}
      >
        <Input label="Nome do visitante" placeholder="Nome completo" value={nome} onChangeText={setNome} />
        <Input label="Documento" placeholder="RG, CPF ou empresa" value={documento} onChangeText={setDocumento} />
        <Input label="Unidade de destino" placeholder="Ex.: Bloco A · 803" value={unidade} onChangeText={setUnidade} />
      </BottomSheet>
    </View>
  );
}
