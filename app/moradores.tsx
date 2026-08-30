import React, { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { Users, Check, Pencil, Trash2, UserPlus } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  Avatar,
  Chip,
  Fab,
  BottomSheet,
  Input,
  Button,
  StatusPill,
  Divider,
  EmptyState,
} from '@core/design-system';
import { initialsOf } from '@shared/utils/format';
import type { Morador, TipoMorador, StatusTone } from '@shared/types';

const TIPO_META: Record<TipoMorador, { label: string; tone: StatusTone }> = {
  proprietario: { label: 'Proprietário', tone: 'approved' },
  inquilino: { label: 'Inquilino', tone: 'info' },
  dependente: { label: 'Dependente', tone: 'neutral' },
};
const TIPOS: TipoMorador[] = ['proprietario', 'inquilino', 'dependente'];

export default function Moradores() {
  const t = useTheme();
  const { user } = useSession();
  const repo = useRepositories();
  const unidadeId = user?.unidadeId ?? 'un-0803';
  const unidadeLabel = user?.unidadeLabel ?? 'Bloco A · 803';

  const { data, loading, reload } = useAsync(() => repo.moradores.listByUnidade(unidadeId), [unidadeId]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoMorador>('dependente');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');

  function abrirNovo() {
    setEditId(null);
    setNome('');
    setTipo('dependente');
    setDocumento('');
    setTelefone('');
    setOpen(true);
  }

  function abrirEdicao(m: Morador) {
    setEditId(m.id);
    setNome(m.nome);
    setTipo(m.tipo);
    setDocumento(m.documento);
    setTelefone(m.telefone);
    setOpen(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do morador.');
      return;
    }
    if (editId) {
      await repo.moradores.update(editId, { nome: nome.trim(), tipo, documento: documento.trim(), telefone: telefone.trim() });
    } else {
      await repo.moradores.create({ nome: nome.trim(), tipo, documento: documento.trim() || 'Não informado', telefone: telefone.trim() || '—', unidadeId, unidadeLabel });
    }
    setOpen(false);
    reload();
  }

  function remover(m: Morador) {
    Alert.alert('Remover', `Remover ${m.nome} da unidade?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await repo.moradores.remove(m.id); reload(); } },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Moradores" subtitle={unidadeLabel} back icon={Users} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <Text variant="caption" color="muted" style={{ marginBottom: t.spacing.md }}>
          {(data?.length ?? 0)} pessoa(s) cadastrada(s) nesta unidade
        </Text>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={UserPlus} title="Nenhum morador" message="Cadastre proprietários, inquilinos e dependentes." actionLabel="Cadastrar" onAction={abrirNovo} />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((m) => (
            <Card key={m.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <Avatar initials={initialsOf(m.nome)} size={44} tone="neutral" />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{m.nome}</Text>
                  <Text mono variant="caption" color="muted" style={{ marginTop: 2 }}>{m.documento}</Text>
                  <Text variant="caption" color="muted">{m.telefone}</Text>
                </View>
                <StatusPill label={TIPO_META[m.tipo].label} tone={TIPO_META[m.tipo].tone} dot={false} />
              </View>
              <Divider spacing={t.spacing.md} />
              <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                <Pressable onPress={() => abrirEdicao(m)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pencil size={16} color={t.brand.primary} />
                  <Text variant="label" color="brand">Editar</Text>
                </Pressable>
                <Pressable onPress={() => remover(m)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={16} color={t.status.danger.fg} />
                  <Text variant="label" style={{ color: t.status.danger.fg }}>Remover</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      </Screen>

      <Fab label="Cadastrar" icon={UserPlus} onPress={abrirNovo} />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={editId ? 'Editar morador' : 'Novo morador'}
        subtitle={unidadeLabel}
        footer={<Button label={editId ? 'Salvar alterações' : 'Cadastrar'} icon={Check} fullWidth onPress={salvar} />}
      >
        <Input label="Nome completo" placeholder="Nome" value={nome} onChangeText={setNome} />
        <Text variant="label" color="inkSoft">Vínculo</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {TIPOS.map((tp) => (
            <Chip key={tp} label={TIPO_META[tp].label} selected={tipo === tp} onPress={() => setTipo(tp)} />
          ))}
        </View>
        <Input label="Documento" placeholder="CPF ou RG" value={documento} onChangeText={setDocumento} mono containerStyle={{ marginTop: t.spacing.sm }} />
        <Input label="Telefone" placeholder="(11) 90000-0000" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      </BottomSheet>
    </View>
  );
}
