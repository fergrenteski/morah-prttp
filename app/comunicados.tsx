import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Megaphone, Pin, Check } from 'lucide-react-native';
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
  Chip,
  Fab,
  BottomSheet,
  Input,
  Button,
  EmptyState,
} from '@core/design-system';
import { formatDateTime } from '@shared/utils/format';
import type { ComunicadoTipo, StatusTone } from '@shared/types';

const TIPO_META: Record<ComunicadoTipo, { label: string; tone: StatusTone }> = {
  aviso: { label: 'Aviso', tone: 'info' },
  urgente: { label: 'Urgente', tone: 'danger' },
  evento: { label: 'Evento', tone: 'approved' },
  manutencao: { label: 'Manutenção', tone: 'pending' },
};

const TIPOS: ComunicadoTipo[] = ['aviso', 'urgente', 'evento', 'manutencao'];

export default function Comunicados() {
  const t = useTheme();
  const { isSindico, user } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.comunicados.list());

  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [tipo, setTipo] = useState<ComunicadoTipo>('aviso');

  async function publicar() {
    if (!titulo.trim() || !corpo.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título e mensagem.');
      return;
    }
    await repo.comunicados.publish({ titulo: titulo.trim(), corpo: corpo.trim(), tipo, autor: user?.name ?? 'Administração' });
    setTitulo('');
    setCorpo('');
    setTipo('aviso');
    setOpen(false);
    reload();
  }

  const ordenados = (data ?? []).slice().sort((a, b) => {
    if (a.fixado !== b.fixado) return a.fixado ? -1 : 1;
    return b.publicadoEm.localeCompare(a.publicadoEm);
  });

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Comunicados" subtitle="Avisos do condomínio" back />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {ordenados.length === 0 && !loading && (
          <EmptyState icon={Megaphone} title="Sem comunicados" message="Nenhum aviso publicado ainda." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {ordenados.map((c) => {
            const meta = TIPO_META[c.tipo];
            return (
              <Card key={c.id} accent={c.fixado}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <StatusPill label={meta.label} tone={meta.tone} />
                  {c.fixado && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Pin size={12} color={t.color.faint} />
                      <Text variant="caption" color="faint">Fixado</Text>
                    </View>
                  )}
                </View>
                <Text variant="subheading">{c.titulo}</Text>
                <Text variant="body" color="inkSoft" style={{ marginTop: 4 }}>{c.corpo}</Text>
                <Text variant="caption" color="faint" style={{ marginTop: t.spacing.md }}>
                  {c.autor} · {formatDateTime(c.publicadoEm)}
                </Text>
              </Card>
            );
          })}
        </View>
      </Screen>

      {isSindico && <Fab label="Publicar" onPress={() => setOpen(true)} />}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Novo comunicado"
        subtitle="Publicado para todos os moradores"
        footer={<Button label="Publicar comunicado" icon={Check} fullWidth onPress={publicar} />}
      >
        <Input label="Título" placeholder="Assunto do aviso" value={titulo} onChangeText={setTitulo} />
        <Input label="Mensagem" placeholder="Escreva o comunicado" value={corpo} onChangeText={setCorpo} multiline style={{ minHeight: 100, textAlignVertical: 'top' }} />
        <Text variant="label" color="inkSoft">Tipo</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {TIPOS.map((tp) => (
            <Chip key={tp} label={TIPO_META[tp].label} selected={tipo === tp} onPress={() => setTipo(tp)} />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
