import React, { useState } from 'react';
import { View, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeftRight,
  LogOut,
  RotateCcw,
  LayoutGrid,
  Bell,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSession } from '@core/state/sessionStore';
import { resetAllMockData } from '@mocks/repositories/asyncStore';
import { Screen, BrandHeader, Card, Text, Avatar, Divider, Button } from '@core/design-system';

const ROLE_LABEL = { sindico: 'Síndico(a)', morador: 'Morador(a)', porteiro: 'Porteiro(a)' } as const;

function RowLink({ icon: Icon, label, onPress, danger }: { icon: typeof Bell; label: string; onPress: () => void; danger?: boolean }) {
  const t = useTheme();
  const color = danger ? t.status.danger.fg : t.color.inkSoft;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, minHeight: 48 }}>
      <Icon size={20} color={color} />
      <Text variant="subheading" style={{ flex: 1, color }}>{label}</Text>
      <ChevronRight size={18} color={t.color.faint} />
    </Pressable>
  );
}

export default function Perfil() {
  const t = useTheme();
  const router = useRouter();
  const { tenant } = useTenant();
  const { user, logout } = useSession();
  const [notif, setNotif] = useState(true);

  function sair() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  }

  function resetar() {
    Alert.alert('Redefinir dados', 'Isso restaura os dados de demonstração de todos os condomínios. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Redefinir',
        style: 'destructive',
        onPress: async () => {
          await resetAllMockData();
          Alert.alert('Pronto', 'Dados de demonstração restaurados.');
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Perfil" subtitle={tenant.name} />
      <Screen edgeTop={false}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Avatar initials={user?.avatarInitials ?? '–'} size={56} />
            <View style={{ flex: 1 }}>
              <Text variant="title">{user?.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <View style={{ backgroundColor: t.brand.tint, borderRadius: t.radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text variant="caption" style={{ color: t.brand.primaryStrong }}>
                    {ROLE_LABEL[user?.role ?? 'morador']}
                  </Text>
                </View>
                <Text mono variant="caption" color="muted">{user?.unidadeLabel}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Condomínio ativo
        </Text>
        <Card onPress={() => router.push('/dev/trocar-condominio')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Avatar initials={tenant.initials} size={44} square />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">{tenant.name}</Text>
              <Text variant="caption" color="muted" style={{ textTransform: 'capitalize' }}>
                {tenant.kind} · plano {tenant.plan.replace(/_/g, ' ')}
              </Text>
            </View>
            <ArrowLeftRight size={18} color={t.brand.primary} />
          </View>
        </Card>

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Preferências
        </Text>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, minHeight: 48 }}>
            <Bell size={20} color={t.color.inkSoft} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">Notificações push</Text>
              <Text variant="caption" color="muted">Avisos, encomendas e assembleias</Text>
            </View>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ true: t.brand.primary, false: t.color.line }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Text variant="overline" color="muted" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Protótipo
        </Text>
        <Card>
          <RowLink icon={ArrowLeftRight} label="Trocar condomínio (demo)" onPress={() => router.push('/dev/trocar-condominio')} />
          <Divider />
          <RowLink icon={LayoutGrid} label="UI Kit · Design System" onPress={() => router.push('/ui-kit')} />
          <Divider />
          <RowLink icon={RotateCcw} label="Redefinir dados de demonstração" onPress={resetar} />
        </Card>

        <Button label="Sair da conta" icon={LogOut} variant="danger" fullWidth style={{ marginTop: t.spacing.xl }} onPress={sair} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: t.spacing.lg }}>
          <ShieldCheck size={13} color={t.color.faint} />
          <Text variant="caption" color="faint">Linha de Produção de Software · v1.0 protótipo</Text>
        </View>
      </Screen>
    </View>
  );
}
