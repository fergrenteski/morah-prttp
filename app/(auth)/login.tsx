import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Building2, ChevronDown, ShieldCheck, User, DoorOpen } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { useSessionStore, MOCK_PROFILES } from '@core/state/sessionStore';
import { Text } from '@core/design-system';
import type { Role } from '@shared/types';

const ROLE_META: Record<Role, { label: string; icon: typeof User; hint: string }> = {
  sindico: { label: 'Síndico', icon: ShieldCheck, hint: 'Acesso total + Painel do Síndico' },
  morador: { label: 'Morador', icon: User, hint: 'Serviços da própria unidade' },
  porteiro: { label: 'Porteiro', icon: DoorOpen, hint: 'Apenas portaria e encomendas' },
};

export default function Login() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tenant } = useTenant();
  const login = useSessionStore((s) => s.login);

  function entrar(profileId: string, role: Role) {
    login(profileId);
    router.replace(role === 'porteiro' ? '/portaria' : '/inicio');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + t.spacing.xl,
          paddingBottom: insets.bottom + t.spacing.xl,
          paddingHorizontal: t.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Marca da linha de produção */}
        <Text style={{ fontFamily: t.fontFamily.mono, color: t.brand.primary, fontSize: t.fontSize.xs, letterSpacing: 1.5 }}>
          LINHA DE PRODUÇÃO · SPL
        </Text>
        <Text style={{ color: '#F8FAFC', fontFamily: t.fontFamily.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, marginTop: 6 }}>
          Gestão{'\n'}Condominial
        </Text>
        <Text variant="body" style={{ color: '#94A3B8', marginTop: t.spacing.sm, maxWidth: 300 }}>
          Um mesmo código-base, muitos condomínios. Escolha um perfil para entrar no protótipo.
        </Text>

        {/* Tenant ativo — toca para trocar (prova da variabilidade) */}
        <Pressable
          onPress={() => router.push('/dev/trocar-condominio')}
          style={({ pressed }) => ({
            marginTop: t.spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            gap: t.spacing.md,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: t.radius.lg,
            padding: t.spacing.md,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: t.radius.md,
              backgroundColor: t.brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: t.brand.onPrimary, fontFamily: t.fontFamily.bold }}>
              {tenant.initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" style={{ color: '#64748B' }}>
              CONDOMÍNIO ATIVO
            </Text>
            <Text variant="subheading" style={{ color: '#F8FAFC' }}>
              {tenant.name}
            </Text>
          </View>
          <ChevronDown size={20} color="#64748B" />
        </Pressable>

        <Text variant="overline" style={{ color: '#64748B', marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
          Entrar como
        </Text>

        <View style={{ gap: t.spacing.md }}>
          {MOCK_PROFILES.map((p) => {
            const meta = ROLE_META[p.role];
            const Icon = meta.icon;
            return (
              <Pressable
                key={p.id}
                onPress={() => entrar(p.id, p.role)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.spacing.md,
                  backgroundColor: '#FFFFFF',
                  borderRadius: t.radius.xl,
                  padding: t.spacing.lg,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: t.brand.tint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} color={t.brand.primaryStrong} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="subheading">{p.name}</Text>
                    <View style={{ backgroundColor: t.brand.tint, borderRadius: t.radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text variant="caption" style={{ color: t.brand.primaryStrong }}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                  <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                    {meta.hint}
                  </Text>
                </View>
                <ArrowRight size={20} color={t.brand.primary} />
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: t.spacing.xl }}>
          <Building2 size={13} color="#475569" />
          <Text variant="caption" style={{ color: '#475569' }}>
            Protótipo navegável · dados fictícios · sem backend
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
