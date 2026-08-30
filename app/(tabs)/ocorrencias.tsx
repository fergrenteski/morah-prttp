import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TriangleAlert, ChevronRight, Check, ArrowDownWideNarrow } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  StatusPill,
  Chip,
  Fab,
  BottomSheet,
  Input,
  Button,
  EmptyState,
} from '@core/design-system';
import { timeAgo } from '@shared/utils/format';
import { calcularSla, pesoSla, PRIORIDADE_LABEL, PRIORIDADE_TONE } from '@shared/rules';
import type { Prioridade, OcorrenciaStatus, StatusTone } from '@shared/types';

const STATUS_META: Record<OcorrenciaStatus, { label: string; tone: StatusTone }> = {
  aberta: { label: 'Aberta', tone: 'info' },
  em_andamento: { label: 'Em andamento', tone: 'pending' },
  resolvida: { label: 'Resolvida', tone: 'success' },
  encerrada: { label: 'Encerrada', tone: 'neutral' },
};

const PRIORIDADES: Prioridade[] = ['baixa', 'media', 'alta', 'critica'];
const CATEGORIAS = ['Hidráulica', 'Elétrica', 'Segurança', 'Convivência', 'Limpeza', 'Outros'];

export default function Ocorrencias() {
  const t = useTheme();
  const router = useRouter();
  const { rules } = useTenant();
  const { user } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.ocorrencias.list());

  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [prioridade, setPrioridade] = useState<Prioridade>('media');

  const ordenadas = (data ?? [])
    .slice()
    .sort((a, b) => pesoSla(calcularSla(b, rules)) - pesoSla(calcularSla(a, rules)));

  async function salvar() {
    if (!titulo.trim()) {
      Alert.alert('Título obrigatório', 'Descreva brevemente a ocorrência.');
      return;
    }
    await repo.ocorrencias.create({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      prioridade,
      unidadeId: user?.unidadeId ?? '',
      autor: user?.name ?? '',
    });
    setTitulo('');
    setDescricao('');
    setCategoria(CATEGORIAS[0]);
    setPrioridade('media');
    setOpen(false);
    reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Ocorrências" subtitle="Chamados ordenados por SLA" icon={TriangleAlert} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.spacing.md }}>
          <ArrowDownWideNarrow size={15} color={t.color.muted} />
          <Text variant="caption" color="muted">
            Mais urgentes primeiro · SLA por prioridade
          </Text>
        </View>

        {ordenadas.length === 0 && !loading && (
          <EmptyState
            icon={TriangleAlert}
            title="Nenhum chamado"
            message="Abra uma ocorrência para a administração acompanhar."
            actionLabel="Abrir chamado"
            onAction={() => setOpen(true)}
          />
        )}

        <View style={{ gap: t.spacing.md }}>
          {ordenadas.map((o) => {
            const sla = calcularSla(o, rules);
            const sm = STATUS_META[o.status];
            return (
              <Card key={o.id} onPress={() => router.push(`/ocorrencia/${o.id}`)} accent={sla.violado}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <StatusPill label={PRIORIDADE_LABEL[o.prioridade]} tone={PRIORIDADE_TONE[o.prioridade]} dot={false} />
                      <StatusPill label={sm.label} tone={sm.tone} />
                    </View>
                    <Text variant="subheading" numberOfLines={1}>{o.titulo}</Text>
                    <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                      {o.categoria} · {o.autor} · {timeAgo(o.abertaEm)}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={t.color.faint} />
                </View>
                <View style={{ marginTop: t.spacing.md }}>
                  <StatusPill label={sla.rotulo} tone={sla.tone} />
                </View>
              </Card>
            );
          })}
        </View>
      </Screen>

      <Fab label="Abrir chamado" onPress={() => setOpen(true)} />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Abrir ocorrência"
        subtitle="A administração acompanha pelo SLA da prioridade"
        footer={<Button label="Abrir chamado" icon={Check} fullWidth onPress={salvar} />}
      >
        <Input label="Título" placeholder="Ex.: Vazamento na garagem" value={titulo} onChangeText={setTitulo} />
        <Input
          label="Descrição"
          placeholder="Detalhe o que está acontecendo"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />
        <Text variant="label" color="inkSoft">Categoria</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {CATEGORIAS.map((c) => (
            <Chip key={c} label={c} selected={categoria === c} onPress={() => setCategoria(c)} />
          ))}
        </View>
        <Text variant="label" color="inkSoft" style={{ marginTop: t.spacing.sm }}>Prioridade</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {PRIORIDADES.map((p) => (
            <Chip
              key={p}
              label={`${PRIORIDADE_LABEL[p]} · SLA ${rules.slaHoras[p]}h`}
              selected={prioridade === p}
              onPress={() => setPrioridade(p)}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
