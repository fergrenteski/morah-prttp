import React, { useMemo, useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { CalendarCheck2, Users, X, Check } from 'lucide-react-native';
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
  Chip,
  Button,
  StatusPill,
  Fab,
  BottomSheet,
  Input,
  EmptyState,
  Divider,
} from '@core/design-system';
import { formatDate } from '@shared/utils/format';
import { podeReservar } from '@shared/rules';
import type { AreaComum, Reserva, ReservaStatus, StatusTone } from '@shared/types';

const STATUS: Record<ReservaStatus, { label: string; tone: StatusTone }> = {
  confirmada: { label: 'Confirmada', tone: 'success' },
  pendente: { label: 'Pendente', tone: 'pending' },
  cancelada: { label: 'Cancelada', tone: 'neutral' },
};

function proximosDias(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function Reservas() {
  const t = useTheme();
  const { rules } = useTenant();
  const { user } = useSession();
  const repo = useRepositories();

  const { data: reservas, loading, reload } = useAsync(() => repo.reservas.list());
  const { data: areas } = useAsync(() => repo.reservas.listAreas());

  const [open, setOpen] = useState(false);
  const [areaId, setAreaId] = useState<string>('');
  const [dia, setDia] = useState<string>('');
  const [horario, setHorario] = useState<string>('');
  const [convidados, setConvidados] = useState('');

  const dias = useMemo(() => proximosDias(10), []);
  const areaSel: AreaComum | undefined = areas?.find((a) => a.id === areaId);

  const ocupados = (reservas ?? [])
    .filter((r) => r.areaId === areaId && r.data === dia && r.status !== 'cancelada')
    .map((r) => r.horario);

  function resetForm() {
    setAreaId('');
    setDia('');
    setHorario('');
    setConvidados('');
  }

  async function salvar() {
    if (!areaId || !dia || !horario) {
      Alert.alert('Reserva incompleta', 'Escolha a área, o dia e o horário.');
      return;
    }
    const check = podeReservar(dia, rules);
    if (!check.ok) {
      Alert.alert('Não foi possível reservar', check.motivo ?? '');
      return;
    }
    await repo.reservas.create({
      areaId,
      data: dia,
      horario,
      unidadeId: user?.unidadeId ?? '',
      solicitante: user?.name ?? '',
      convidados: Number(convidados) || 0,
    });
    setOpen(false);
    resetForm();
    reload();
  }

  function cancelar(r: Reserva) {
    Alert.alert('Cancelar reserva', `Cancelar ${r.areaNome} em ${formatDate(r.data)}?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          await repo.reservas.cancel(r.id);
          reload();
        },
      },
    ]);
  }

  const ordenadas = (reservas ?? []).slice().sort((a, b) => b.data.localeCompare(a.data));

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Reservas" subtitle="Áreas comuns" icon={CalendarCheck2} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {ordenadas.length === 0 && !loading && (
          <EmptyState
            icon={CalendarCheck2}
            title="Nenhuma reserva"
            message="Toque em Reservar para agendar uma área comum."
            actionLabel="Reservar área"
            onAction={() => setOpen(true)}
          />
        )}
        <View style={{ gap: t.spacing.md }}>
          {ordenadas.map((r) => {
            const meta = STATUS[r.status];
            return (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{r.areaNome}</Text>
                    <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                      {formatDate(r.data)} · {r.horario}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Users size={13} color={t.color.faint} />
                      <Text variant="caption" color="muted">{r.convidados} convidado(s)</Text>
                    </View>
                  </View>
                  <StatusPill label={meta.label} tone={meta.tone} />
                </View>
                {r.status !== 'cancelada' && (
                  <>
                    <Divider spacing={t.spacing.md} />
                    <Button label="Cancelar reserva" variant="ghost" size="sm" icon={X} onPress={() => cancelar(r)} />
                  </>
                )}
              </Card>
            );
          })}
        </View>
      </Screen>

      <Fab label="Reservar" onPress={() => setOpen(true)} />

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Nova reserva"
        subtitle={`Antecedência mínima: ${rules.reservaAntecedenciaMinimaHoras}h`}
        footer={<Button label="Confirmar reserva" icon={Check} fullWidth onPress={salvar} />}
      >
        <Text variant="label" color="inkSoft">Área comum</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {areas?.map((a) => (
            <Chip
              key={a.id}
              label={a.nome}
              selected={areaId === a.id}
              onPress={() => {
                setAreaId(a.id);
                setHorario('');
              }}
            />
          ))}
        </View>

        <Text variant="label" color="inkSoft" style={{ marginTop: t.spacing.sm }}>Dia</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
          {dias.map((d) => (
            <Chip
              key={d}
              label={formatDate(d).slice(0, 5)}
              selected={dia === d}
              onPress={() => setDia(d)}
            />
          ))}
        </View>

        {areaSel && (
          <>
            <Text variant="label" color="inkSoft" style={{ marginTop: t.spacing.sm }}>Horário</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
              {areaSel.horarios.map((h) => {
                const taken = ocupados.includes(h);
                return (
                  <Pressable key={h} disabled={taken} onPress={() => setHorario(h)}>
                    <Chip label={taken ? `${h} · ocupado` : h} selected={horario === h} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Input
          label="Convidados"
          keyboardType="number-pad"
          placeholder="0"
          mono
          value={convidados}
          onChangeText={setConvidados}
          containerStyle={{ marginTop: t.spacing.sm }}
        />
      </BottomSheet>
    </View>
  );
}
