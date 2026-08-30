import React from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import {
  ShieldCheck,
  CalendarCheck2,
  TriangleAlert,
  ShoppingBag,
  Megaphone,
  Check,
  X,
  ChevronRight,
} from 'lucide-react-native';
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
  Stat,
  StatusPill,
  Button,
  SectionHeader,
  Divider,
  EmptyState,
} from '@core/design-system';
import { formatDate } from '@shared/utils/format';
import { calcularSla, PRIORIDADE_LABEL, PRIORIDADE_TONE } from '@shared/rules';

export default function Admin() {
  const t = useTheme();
  const router = useRouter();
  const { rules } = useTenant();
  const { isSindico } = useSession();
  const repo = useRepositories();

  const { data, loading, reload } = useAsync(async () => {
    const [reservas, ocorrencias, marketplace] = await Promise.all([
      repo.reservas.list(),
      repo.ocorrencias.list(),
      repo.marketplace.list(),
    ]);
    return { reservas, ocorrencias, marketplace };
  });

  if (!isSindico) return <Redirect href="/inicio" />;

  const reservasPendentes = (data?.reservas ?? []).filter((r) => r.status === 'pendente');
  const chamadosViolados = (data?.ocorrencias ?? []).filter(
    (o) => (o.status === 'aberta' || o.status === 'em_andamento') && calcularSla(o, rules).violado,
  );
  const moderacao = (data?.marketplace ?? []).filter((i) => i.status === 'em_moderacao');

  async function aprovarReserva(id: string, aprovar: boolean) {
    await repo.reservas.setStatus(id, aprovar ? 'confirmada' : 'cancelada');
    reload();
  }
  async function moderarItem(id: string, aprovar: boolean) {
    await repo.marketplace.moderar(id, aprovar);
    reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Painel do Síndico" subtitle="Aprovações, moderação e SLA" back icon={ShieldCheck} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <Stat value={String(reservasPendentes.length)} label="reservas a aprovar" icon={CalendarCheck2} tone={reservasPendentes.length ? 'pending' : 'success'} mono />
          <Stat value={String(chamadosViolados.length)} label="SLA vencido" icon={TriangleAlert} tone={chamadosViolados.length ? 'danger' : 'success'} mono />
          <Stat value={String(moderacao.length)} label="a moderar" icon={ShoppingBag} tone={moderacao.length ? 'info' : 'success'} mono />
        </View>

        {/* Reservas pendentes */}
        <SectionHeader title="Reservas pendentes" overline="Aprovações" />
        {reservasPendentes.length === 0 ? (
          <EmptyState icon={CalendarCheck2} title="Tudo em dia" message="Nenhuma reserva aguardando aprovação." />
        ) : (
          <View style={{ gap: t.spacing.md }}>
            {reservasPendentes.map((r) => (
              <Card key={r.id}>
                <Text variant="subheading">{r.areaNome}</Text>
                <Text variant="caption" color="muted">{formatDate(r.data)} · {r.horario} · {r.solicitante}</Text>
                <Divider spacing={t.spacing.md} />
                <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                  <Button label="Aprovar" icon={Check} variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => aprovarReserva(r.id, true)} />
                  <Button label="Recusar" icon={X} variant="danger" size="sm" style={{ flex: 1 }} onPress={() => aprovarReserva(r.id, false)} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Moderação de desapegos */}
        <SectionHeader title="Moderar desapegos" overline="Marketplace" />
        {moderacao.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Sem pendências" message="Nenhum anúncio aguardando moderação." />
        ) : (
          <View style={{ gap: t.spacing.md }}>
            {moderacao.map((i) => (
              <Card key={i.id} accent>
                <Text variant="subheading">{i.titulo}</Text>
                <Text variant="caption" color="muted">{i.categoria} · {i.vendedor}</Text>
                <Divider spacing={t.spacing.md} />
                <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                  <Button label="Aprovar" icon={Check} variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => moderarItem(i.id, true)} />
                  <Button label="Reprovar" icon={X} variant="danger" size="sm" style={{ flex: 1 }} onPress={() => moderarItem(i.id, false)} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Chamados com SLA vencido */}
        <SectionHeader title="SLA vencido" overline="Ocorrências" />
        {chamadosViolados.length === 0 ? (
          <EmptyState icon={TriangleAlert} title="Nenhum atraso" message="Nenhum chamado com SLA estourado." />
        ) : (
          <View style={{ gap: t.spacing.md }}>
            {chamadosViolados.map((o) => {
              const sla = calcularSla(o, rules);
              return (
                <Card key={o.id} accent onPress={() => router.push(`/ocorrencia/${o.id}`)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                        <StatusPill label={PRIORIDADE_LABEL[o.prioridade]} tone={PRIORIDADE_TONE[o.prioridade]} dot={false} />
                        <StatusPill label={sla.rotulo} tone="danger" />
                      </View>
                      <Text variant="subheading" numberOfLines={1}>{o.titulo}</Text>
                    </View>
                    <ChevronRight size={18} color={t.color.faint} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <Button label="Publicar comunicado" icon={Megaphone} variant="outline" fullWidth style={{ marginTop: t.spacing.xl }} onPress={() => router.push('/comunicados')} />
      </Screen>
    </View>
  );
}
