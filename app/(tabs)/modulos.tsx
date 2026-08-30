import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, ArrowLeftRight, LayoutGrid, CircleUser, Sparkles } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSession } from '@core/state/sessionStore';
import { gridModulesFor } from '@core/navigation/moduleRegistry';
import type { ModuleDef } from '@core/navigation/moduleRegistry';
import { Screen, BrandHeader, Text, Card, SectionHeader } from '@core/design-system';

function Tile({ mod, onPress }: { mod: ModuleDef; onPress: () => void }) {
  const t = useTheme();
  const Icon = mod.icon;
  return (
    <Pressable onPress={onPress} style={{ width: '47%' }}>
      <Card padded style={{ minHeight: 116, justifyContent: 'space-between' }} raised={false}>
        {mod.exclusive && (
          <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: t.brand.tint, paddingHorizontal: 7, paddingVertical: 2, borderRadius: t.radius.pill }}>
            <Sparkles size={11} color={t.brand.primaryStrong} />
            <Text variant="caption" style={{ color: t.brand.primaryStrong, fontSize: 10 }}>exclusivo</Text>
          </View>
        )}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: t.radius.md,
            backgroundColor: t.brand.tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} color={t.brand.primaryStrong} strokeWidth={2.2} />
        </View>
        <View>
          <Text variant="subheading" numberOfLines={1}>{mod.label}</Text>
          <Text variant="caption" color="muted" numberOfLines={1}>{mod.description}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export default function Modulos() {
  const t = useTheme();
  const router = useRouter();
  const { tenant } = useTenant();
  const { user, isSindico } = useSession();

  const mods = gridModulesFor(tenant, user?.role ?? 'morador');

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Módulos" subtitle={`${tenant.name} · ${tenant.enabledModules.length} ativos`} icon={LayoutGrid} />
      <Screen edgeTop={false}>
        <SectionHeader title="Todos os módulos" overline="Habilitados por este condomínio" style={{ marginTop: 0 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: t.spacing.md }}>
          {mods.map((m) => (
            <Tile key={m.slug} mod={m} onPress={() => router.push(m.route as never)} />
          ))}
        </View>

        {isSindico && (
          <>
            <SectionHeader title="Administração" overline="Somente síndico" />
            <Card onPress={() => router.push('/admin')} tone="tint">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                <ShieldCheck size={22} color={t.brand.primaryStrong} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading" style={{ color: t.brand.primaryStrong }}>Painel do Síndico</Text>
                  <Text variant="caption" color="muted">Aprovar reservas, moderar desapegos, SLA</Text>
                </View>
              </View>
            </Card>
          </>
        )}

        <SectionHeader title="Conta e demonstração" overline="Protótipo" />
        <Card>
          <Pressable onPress={() => router.push('/perfil')} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.sm }}>
            <CircleUser size={20} color={t.color.inkSoft} />
            <Text variant="subheading" style={{ flex: 1 }}>Perfil e configurações</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/dev/trocar-condominio')} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.sm }}>
            <ArrowLeftRight size={20} color={t.color.inkSoft} />
            <Text variant="subheading" style={{ flex: 1 }}>Trocar condomínio (demo)</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/ui-kit')} style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.sm }}>
            <LayoutGrid size={20} color={t.color.inkSoft} />
            <Text variant="subheading" style={{ flex: 1 }}>UI Kit (design system)</Text>
          </Pressable>
        </Card>
      </Screen>
    </View>
  );
}
