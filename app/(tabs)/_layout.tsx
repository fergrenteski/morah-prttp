import React from 'react';
import { Tabs } from 'expo-router';
import {
  House,
  Receipt,
  CalendarCheck2,
  TriangleAlert,
  LayoutGrid,
  DoorOpen,
  CircleUser,
  type LucideIcon,
} from 'lucide-react-native';
import { Platform, type ColorValue } from 'react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useSession } from '@core/state/sessionStore';
import { Redirect } from 'expo-router';

/**
 * Tab bar dinâmica conforme o PAPEL do usuário e os MÓDULOS do tenant.
 * Porteiro vê apenas Portaria + Perfil; morador/síndico veem o conjunto
 * principal + a grade "Mais" (que lista todos os módulos habilitados).
 */
export default function TabsLayout() {
  const t = useTheme();
  const { user, isPorteiro } = useSession();

  if (!user) return <Redirect href="/login" />;

  const iconFor =
    (Icon: LucideIcon) =>
    ({ color, focused }: { color: ColorValue; focused: boolean }) => (
      <Icon size={23} color={color as string} strokeWidth={focused ? 2.6 : 2} />
    );

  // Conjunto de abas visíveis por papel.
  const visible = new Set<string>(
    isPorteiro ? ['portaria', 'perfil'] : ['inicio', 'financeiro', 'reservas', 'ocorrencias', 'modulos'],
  );
  const hide = (name: string) => (visible.has(name) ? undefined : null);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.brand.primary,
        tabBarInactiveTintColor: t.color.faint,
        tabBarStyle: {
          backgroundColor: t.color.surface,
          borderTopColor: t.color.line,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: t.fontFamily.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{ title: 'Início', href: hide('inicio'), tabBarIcon: iconFor(House) }}
      />
      <Tabs.Screen
        name="financeiro"
        options={{ title: 'Financeiro', href: hide('financeiro'), tabBarIcon: iconFor(Receipt) }}
      />
      <Tabs.Screen
        name="reservas"
        options={{ title: 'Reservas', href: hide('reservas'), tabBarIcon: iconFor(CalendarCheck2) }}
      />
      <Tabs.Screen
        name="ocorrencias"
        options={{ title: 'Chamados', href: hide('ocorrencias'), tabBarIcon: iconFor(TriangleAlert) }}
      />
      <Tabs.Screen
        name="portaria"
        options={{ title: 'Portaria', href: hide('portaria'), tabBarIcon: iconFor(DoorOpen) }}
      />
      <Tabs.Screen
        name="modulos"
        options={{ title: 'Mais', href: hide('modulos'), tabBarIcon: iconFor(LayoutGrid) }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', href: hide('perfil'), tabBarIcon: iconFor(CircleUser) }}
      />
    </Tabs>
  );
}
