/**
 * sessionStore — usuário/perfil ativo (variabilidade por papel).
 *
 * Três perfis pré-cadastrados (síndico / morador / porteiro) para o login mock.
 * O papel define o que cada tela e a tab bar exibem (RBAC).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role, UserProfile } from '@shared/types';

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'u-sindico',
    name: 'Helena Prado',
    role: 'sindico',
    unidadeId: 'un-1201',
    unidadeLabel: 'Bloco A · 1201',
    avatarInitials: 'HP',
  },
  {
    id: 'u-morador',
    name: 'Rafael Nunes',
    role: 'morador',
    unidadeId: 'un-0803',
    unidadeLabel: 'Bloco A · 803',
    avatarInitials: 'RN',
  },
  {
    id: 'u-porteiro',
    name: 'Márcia Lopes',
    role: 'porteiro',
    unidadeId: 'un-portaria',
    unidadeLabel: 'Portaria Central',
    avatarInitials: 'ML',
  },
];

interface SessionState {
  user: UserProfile | null;
  login: (profileId: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: (profileId) =>
        set({ user: MOCK_PROFILES.find((p) => p.id === profileId) ?? null }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'spl.session',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Hook de conveniência para papel/permissões. */
export function useSession(): {
  user: UserProfile | null;
  role: Role | null;
  isSindico: boolean;
  isPorteiro: boolean;
  isMorador: boolean;
  login: (id: string) => void;
  logout: () => void;
} {
  const user = useSessionStore((s) => s.user);
  const login = useSessionStore((s) => s.login);
  const logout = useSessionStore((s) => s.logout);
  return {
    user,
    role: user?.role ?? null,
    isSindico: user?.role === 'sindico',
    isPorteiro: user?.role === 'porteiro',
    isMorador: user?.role === 'morador',
    login,
    logout,
  };
}
