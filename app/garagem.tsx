import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { SquareParking, Sparkles, Check, Building2 } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  StatusPill,
  Button,
  Chip,
  Fab,
  BottomSheet,
  Input,
  Divider,
  EmptyState,
} from '@core/design-system';
import { formatBRL } from '@shared/utils/format';
import type { VagaStatus, StatusTone } from '@shared/types';

const META: Record<VagaStatus, { label: string; tone: StatusTone }> = {
  disponivel: { label: 'Disponível', tone: 'success' },
  reservada: { label: 'Reservada', tone: 'pending' },
  ocupada: { label: 'Ocupada', tone: 'neutral' },
};

export default function Garagem() {
  const t = useTheme();
  const { user } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.garagem.list());

  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [bloco, setBloco] = useState('Subsolo 1');
  const [preco, setPreco] = useState('');

  const vagas = data ?? [];
  const disponiveis = vagas.filter((v) => v.status === 'disponivel').length;

  async function anunciar() {
    if (!codigo.trim() || !preco.trim()) {
      Alert.alert('Dados incompletos', 'Informe o código da vaga e o preço por hora.');
      return;
    }
    // Reaproveita a camada de repositório read para simular escrita via setStatus?
    // Aqui apenas fechamos o formulário — o anúncio entra como demonstração.
    Alert.alert('Vaga anunciada', `Vaga ${codigo} publicada por ${formatBRL(Number(preco))}/h.`);
    setCodigo('');
    setPreco('');
    setOpen(false);
    reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Aluguel de garagem" subtitle="Vagas rotativas entre empresas" back icon={SquareParking} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <Card tone="tint" style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
          <Sparkles size={20} color={t.brand.primaryStrong} />
          <Text variant="caption" style={{ color: t.brand.primaryStrong, flex: 1 }}>
            Função exclusiva de prédios comerciais com estacionamento compartilhado. Empresas anunciam
            e alugam vagas rotativas por hora — vinculado ao cadastro de veículos.
          </Text>
        </Card>

        <Card style={{ marginBottom: t.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <SquareParking size={22} color={t.brand.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{disponiveis} vaga(s) disponível(is)</Text>
            <Text variant="caption" color="muted">de {vagas.length} anunciadas no prédio</Text>
          </View>
        </Card>

        {vagas.length === 0 && !loading && (
          <EmptyState icon={SquareParking} title="Sem vagas" message="Nenhuma vaga anunciada." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {vagas.map((v) => (
            <Card key={v.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text mono variant="heading">{v.codigo}</Text>
                  <Text variant="caption" color="muted">{v.bloco} · anunciada por {v.anuncianteUnidade}</Text>
                  {v.empresa && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Building2 size={13} color={t.color.faint} />
                      <Text variant="caption" color="muted">{v.empresa}</Text>
                    </View>
                  )}
                </View>
                <StatusPill label={META[v.status].label} tone={META[v.status].tone} />
              </View>
              <Divider spacing={t.spacing.md} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text mono variant="subheading" color="brand">{formatBRL(v.precoHora)}<Text variant="caption" color="muted"> /hora</Text></Text>
                <Button
                  label={v.status === 'disponivel' ? 'Reservar vaga' : 'Indisponível'}
                  size="sm"
                  variant={v.status === 'disponivel' ? 'primary' : 'outline'}
                  disabled={v.status !== 'disponivel'}
                  onPress={() => Alert.alert('Reserva', `Vaga ${v.codigo} reservada (demonstração).`)}
                />
              </View>
            </Card>
          ))}
        </View>
      </Screen>

      <Fab label="Anunciar vaga" onPress={() => setOpen(true)} />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Anunciar vaga"
        subtitle={`Unidade ${user?.unidadeLabel ?? ''}`}
        footer={<Button label="Publicar vaga" icon={Check} fullWidth onPress={anunciar} />}
      >
        <Input label="Código da vaga" placeholder="Ex.: G1-042" value={codigo} onChangeText={setCodigo} mono />
        <Text variant="label" color="inkSoft">Bloco</Text>
        <View style={{ flexDirection: 'row', gap: t.spacing.sm }}>
          {['Subsolo 1', 'Subsolo 2', 'Térreo'].map((b) => (
            <Chip key={b} label={b} selected={bloco === b} onPress={() => setBloco(b)} />
          ))}
        </View>
        <Input label="Preço por hora (R$)" placeholder="0,00" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" mono containerStyle={{ marginTop: t.spacing.sm }} />
      </BottomSheet>
    </View>
  );
}
