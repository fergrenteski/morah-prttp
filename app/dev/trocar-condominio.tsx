import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Sparkles, Boxes } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import { TENANTS } from '@tenants/index';
import { getModule } from '@core/navigation/moduleRegistry';
import { Text, Card } from '@core/design-system';

export default function TrocarCondominio() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tenant: ativo, setTenant } = useTenant();

  return (
    <View style={{ flex: 1, backgroundColor: t.color.bg }}>
      <View style={{ paddingTop: insets.top + t.spacing.md, paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.md, backgroundColor: t.color.surface, borderBottomWidth: 1, borderBottomColor: t.color.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text variant="overline" color="brand">Modo demonstração</Text>
            <Text variant="title">Trocar condomínio</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Fechar">
            <X size={26} color={t.color.muted} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: insets.bottom + t.spacing.xl, gap: t.spacing.md }}>
        <Card tone="inset">
          <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
            <Sparkles size={20} color={t.brand.primary} />
            <Text variant="body" color="inkSoft" style={{ flex: 1 }}>
              O mesmo código-base atende os dois clientes abaixo. Ao trocar, a marca,
              a tab bar e os módulos visíveis mudam <Text variant="bodyStrong">instantaneamente</Text> — sem recarregar o app.
            </Text>
          </View>
        </Card>

        {TENANTS.map((tn) => {
          const isAtivo = tn.id === ativo.id;
          const exclusivos = tn.customFeatures
            .map((f) => {
              const mod = tn.enabledModules
                .map(getModule)
                .find((m) => m?.requiredFeature === f);
              return mod?.label;
            })
            .filter(Boolean) as string[];

          return (
            <Pressable key={tn.id} onPress={() => setTenant(tn.id)}>
              <Card
                style={{
                  borderWidth: 2,
                  borderColor: isAtivo ? tn.brand.primary : t.color.line,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                  <View style={{ width: 52, height: 52, borderRadius: t.radius.md, backgroundColor: tn.brand.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: tn.brand.onPrimary, fontFamily: t.fontFamily.bold, fontSize: t.fontSize.lg }}>
                      {tn.initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{tn.name}</Text>
                    <Text variant="caption" color="muted" style={{ textTransform: 'capitalize' }}>
                      {tn.kind} · plano {tn.plan.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  {isAtivo && (
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: tn.brand.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={16} color={tn.brand.onPrimary} strokeWidth={3} />
                    </View>
                  )}
                </View>

                {/* Amostra da paleta */}
                <View style={{ flexDirection: 'row', gap: 6, marginTop: t.spacing.md }}>
                  {[tn.brand.primary, tn.brand.primaryStrong, tn.brand.secondary, tn.brand.tint].map((c) => (
                    <View key={c} style={{ flex: 1, height: 26, borderRadius: t.radius.sm, backgroundColor: c, borderWidth: 1, borderColor: t.color.line }} />
                  ))}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: t.spacing.md }}>
                  <Boxes size={14} color={t.color.muted} />
                  <Text variant="caption" color="muted">{tn.enabledModules.length} módulos habilitados</Text>
                </View>

                {exclusivos.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: t.spacing.sm }}>
                    {exclusivos.map((e) => (
                      <View key={e} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: tn.brand.tint, borderRadius: t.radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Sparkles size={11} color={tn.brand.primaryStrong} />
                        <Text variant="caption" style={{ color: tn.brand.primaryStrong, fontSize: 11 }}>{e}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}

        <Text variant="caption" color="faint" center style={{ marginTop: t.spacing.sm }}>
          Adicionar um novo cliente = criar um arquivo JSON em /src/tenants
        </Text>
      </ScrollView>
    </View>
  );
}
