import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Megaphone, Receipt, TriangleAlert, CalendarCheck2, Pin } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { gridModulesFor } from '@core/navigation/moduleRegistry';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  Stat,
  StatusPill,
  Avatar,
  SectionHeader,
  IconButton,
} from '@core/design-system';
import { formatBRL, formatDateShort } from '@shared/utils/format';
import { calcularSla } from '@shared/rules';

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Inicio() {
  const t = useTheme();
  const router = useRouter();
  const { tenant, rules } = useTenant();
  const { user, isSindico } = useSession();
  const repo = useRepositories();

  const { data } = useAsync(async () => {
    const [boletos, ocorrencias, reservas, comunicados] = await Promise.all([
      repo.financeiro.list(),
      repo.ocorrencias.list(),
      repo.reservas.list(),
      repo.comunicados.list(),
    ]);
    return { boletos, ocorrencias, reservas, comunicados };
  });

  const boletosAbertos = (data?.boletos ?? []).filter((b) => b.status !== 'pago');
  const totalAberto = boletosAbertos.reduce((s, b) => s + b.valor, 0);
  const chamadosAbertos = (data?.ocorrencias ?? []).filter(
    (o) => o.status === 'aberta' || o.status === 'em_andamento',
  );
  const chamadosViolados = chamadosAbertos.filter((o) => calcularSla(o, rules).violado).length;
  const hoje = new Date().toISOString().slice(0, 10);
  const proximasReservas = (data?.reservas ?? [])
    .filter((r) => r.status !== 'cancelada' && r.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));
  const fixado = (data?.comunicados ?? []).find((c) => c.fixado);

  const atalhos = gridModulesFor(tenant, user?.role ?? 'morador').slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg }}>
      <BrandHeader
        eyebrow={user?.unidadeLabel}
        title={`${saudacao()}, ${user?.name.split(' ')[0]}`}
        subtitle={tenant.name}
        icon={undefined}
        right={
          <Pressable onPress={() => router.push('/perfil')} accessibilityLabel="Abrir perfil">
            <Avatar initials={user?.avatarInitials ?? '–'} tone="neutral" size={44} />
          </Pressable>
        }
      />
      <Screen edgeTop={false}>
        {/* Modo demonstração — prova viva da variabilidade */}
        <Pressable onPress={() => router.push('/dev/trocar-condominio')}>
          <Card tone="tint" padded style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.brand.primary }} />
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ color: t.brand.primaryStrong }}>
                Modo demonstração · trocar condomínio
              </Text>
              <Text variant="caption" color="muted">
                Plano {tenant.plan.replace(/_/g, ' ')} · {tenant.enabledModules.length} módulos ativos
              </Text>
            </View>
            <ArrowRight size={18} color={t.brand.primary} />
          </Card>
        </Pressable>

        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <Stat
            value={formatBRL(totalAberto)}
            label={`${boletosAbertos.length} boleto(s) em aberto`}
            icon={Receipt}
            tone={boletosAbertos.length ? 'pending' : 'success'}
          />
          <Stat
            value={String(chamadosAbertos.length)}
            label={chamadosViolados ? `${chamadosViolados} com SLA vencido` : 'chamados abertos'}
            icon={TriangleAlert}
            tone={chamadosViolados ? 'danger' : 'neutral'}
            mono
          />
        </View>

        {/* Comunicado fixado */}
        {fixado && (
          <>
            <SectionHeader title="Em destaque" overline="Comunicados" />
            <Card accent onPress={() => router.push('/comunicados')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Megaphone size={16} color={t.brand.primary} />
                <Text variant="caption" color="brand">
                  {new Date(fixado.publicadoEm).toLocaleDateString('pt-BR')}
                </Text>
                <Pin size={13} color={t.color.faint} />
              </View>
              <Text variant="subheading">{fixado.titulo}</Text>
              <Text variant="body" color="muted" numberOfLines={2} style={{ marginTop: 4 }}>
                {fixado.corpo}
              </Text>
            </Card>
          </>
        )}

        {/* Próxima reserva */}
        {proximasReservas.length > 0 && (
          <>
            <SectionHeader
              title="Sua agenda"
              overline="Reservas"
              action={
                <Pressable onPress={() => router.push('/reservas')}>
                  <Text variant="label" color="brand">Ver tudo</Text>
                </Pressable>
              }
            />
            <Card onPress={() => router.push('/reservas')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <View style={{ alignItems: 'center', backgroundColor: t.brand.tint, borderRadius: t.radius.md, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text mono style={{ color: t.brand.primaryStrong, fontSize: t.fontSize.lg, lineHeight: t.fontSize.lg * 1.2 }}>
                    {formatDateShort(proximasReservas[0].data).split(' ')[0]}
                  </Text>
                  <Text variant="caption" style={{ color: t.brand.primaryStrong }}>
                    {formatDateShort(proximasReservas[0].data).split(' ')[1]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{proximasReservas[0].areaNome}</Text>
                  <Text variant="caption" color="muted">{proximasReservas[0].horario}</Text>
                </View>
                <StatusPill
                  label={proximasReservas[0].status === 'confirmada' ? 'Confirmada' : 'Pendente'}
                  tone={proximasReservas[0].status === 'confirmada' ? 'success' : 'pending'}
                />
              </View>
            </Card>
          </>
        )}

        {/* Atalhos por módulo habilitado */}
        <SectionHeader
          title="Acesso rápido"
          overline="Módulos"
          action={
            <Pressable onPress={() => router.push('/modulos')}>
              <Text variant="label" color="brand">Ver todos</Text>
            </Pressable>
          }
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md }}>
          {atalhos.map((m) => {
            const Icon = m.icon;
            return (
              <Pressable
                key={m.slug}
                onPress={() => router.push(m.route as never)}
                style={{ width: '30%', alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: t.radius.lg,
                    backgroundColor: t.color.surface,
                    borderWidth: 1,
                    borderColor: t.color.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={t.brand.primaryStrong} strokeWidth={2.1} />
                </View>
                <Text variant="caption" color="inkSoft" center numberOfLines={1}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isSindico && (
          <Card onPress={() => router.push('/admin')} tone="inset" style={{ marginTop: t.spacing.xl, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <IconButton icon={CalendarCheck2} tone="default" onPress={() => router.push('/admin')} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">Painel do Síndico</Text>
              <Text variant="caption" color="muted">Aprovações, moderação e SLA</Text>
            </View>
            <ArrowRight size={18} color={t.color.faint} />
          </Card>
        )}
      </Screen>
    </View>
  );
}
