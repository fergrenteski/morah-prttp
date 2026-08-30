import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageSquare, Send, CircleCheckBig } from 'lucide-react-native';
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
  Button,
  Input,
  Avatar,
  Divider,
} from '@core/design-system';
import { formatDateTime, timeAgo } from '@shared/utils/format';
import { calcularSla, PRIORIDADE_LABEL, PRIORIDADE_TONE } from '@shared/rules';
import { initialsOf } from '@shared/utils/format';
import type { OcorrenciaStatus, StatusTone } from '@shared/types';

const STATUS_META: Record<OcorrenciaStatus, { label: string; tone: StatusTone }> = {
  aberta: { label: 'Aberta', tone: 'info' },
  em_andamento: { label: 'Em andamento', tone: 'pending' },
  resolvida: { label: 'Resolvida', tone: 'success' },
  encerrada: { label: 'Encerrada', tone: 'neutral' },
};

export default function OcorrenciaDetalhe() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rules } = useTenant();
  const { user, isSindico } = useSession();
  const repo = useRepositories();
  const { data: oco, loading, reload } = useAsync(() => repo.ocorrencias.getById(String(id)), [id]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function comentar() {
    if (!texto.trim() || !oco) return;
    setEnviando(true);
    await repo.ocorrencias.comentar(oco.id, user?.name ?? 'Você', texto.trim());
    setTexto('');
    setEnviando(false);
    reload();
  }

  async function encerrar() {
    if (!oco) return;
    await repo.ocorrencias.close(oco.id);
    reload();
  }

  if (loading || !oco) {
    return (
      <View style={{ flex: 1 }}>
        <BrandHeader title="Ocorrência" back />
        <Screen edgeTop={false} />
      </View>
    );
  }

  const sla = calcularSla(oco, rules);
  const sm = STATUS_META[oco.status];
  const encerravel = oco.status !== 'encerrada' && oco.status !== 'resolvida';
  const podeEncerrar = isSindico || oco.autor === user?.name;

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Ocorrência" subtitle={oco.categoria} back />
      <Screen edgeTop={false}>
        <Card accent={sla.violado}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <StatusPill label={PRIORIDADE_LABEL[oco.prioridade]} tone={PRIORIDADE_TONE[oco.prioridade]} dot={false} />
            <StatusPill label={sm.label} tone={sm.tone} />
            <StatusPill label={sla.rotulo} tone={sla.tone} />
          </View>
          <Text variant="heading">{oco.titulo}</Text>
          <Text variant="body" color="inkSoft" style={{ marginTop: 6 }}>{oco.descricao}</Text>
          <Divider spacing={t.spacing.md} />
          <Text variant="caption" color="muted">
            Aberta por {oco.autor} · {formatDateTime(oco.abertaEm)}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          <MessageSquare size={16} color={t.color.muted} />
          <Text variant="overline" color="muted">
            Comentários ({oco.comentarios.length})
          </Text>
        </View>

        <View style={{ gap: t.spacing.md }}>
          {oco.comentarios.map((c) => (
            <Card key={c.id} tone="inset" padded>
              <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                <Avatar initials={initialsOf(c.autor)} size={36} tone="brand" />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="label">{c.autor}</Text>
                    <Text variant="caption" color="faint">{timeAgo(c.em)}</Text>
                  </View>
                  <Text variant="body" color="inkSoft" style={{ marginTop: 2 }}>{c.texto}</Text>
                </View>
              </View>
            </Card>
          ))}
          {oco.comentarios.length === 0 && (
            <Text variant="body" color="muted">Ainda não há comentários neste chamado.</Text>
          )}
        </View>

        {oco.status !== 'encerrada' && (
          <View style={{ marginTop: t.spacing.lg, gap: t.spacing.md }}>
            <Input
              placeholder="Escreva um comentário…"
              value={texto}
              onChangeText={setTexto}
              multiline
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />
            <Button label="Comentar" icon={Send} onPress={comentar} loading={enviando} disabled={!texto.trim()} />
          </View>
        )}

        {encerravel && podeEncerrar && (
          <Button
            label="Encerrar ocorrência"
            icon={CircleCheckBig}
            variant="outline"
            fullWidth
            style={{ marginTop: t.spacing.md }}
            onPress={encerrar}
          />
        )}
      </Screen>
    </View>
  );
}
