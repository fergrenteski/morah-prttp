/**
 * moduleRegistry — fonte única de verdade sobre os módulos da linha de produção
 * (ativo reutilizável nº 4 / feature flags).
 *
 * Cada módulo declara: rota, ícone, grupo, papéis permitidos, se é exclusivo de
 * um tipo de cliente e qual feature custom exige. A decisão de "aparece ou não"
 * fica AQUI, centralizada — nenhuma tela faz `if (tenant.id === 'x')`.
 */
import {
  House,
  Receipt,
  DoorOpen,
  CalendarCheck2,
  Megaphone,
  TriangleAlert,
  Vote,
  Wrench,
  Users,
  FileText,
  PawPrint,
  ShoppingBag,
  WashingMachine,
  WavesLadder,
  Car,
  HardHat,
  SquareParking,
  UserCog,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import type { Tenant } from '@core/theme/types';
import type { Role } from '@shared/types';

export type ModuleGroup = 'principal' | 'gestao' | 'servicos' | 'addon' | 'exclusivo' | 'admin';

export interface ModuleDef {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  group: ModuleGroup;
  /** aparece como aba principal na tab bar (para morador/síndico) */
  tab?: boolean;
  /** papéis que podem acessar (default: síndico + morador) */
  roles?: Role[];
  /** função exclusiva de um tipo de cliente (destaque na UI) */
  exclusive?: boolean;
  /** ignora enabledModules — sempre disponível se o papel permitir (ex.: admin) */
  alwaysOn?: boolean;
  /** exige uma customFeature do tenant */
  requiredFeature?: string;
}

const ALL: Role[] = ['sindico', 'morador'];

export const MODULE_REGISTRY: ModuleDef[] = [
  {
    slug: 'inicio',
    label: 'Início',
    description: 'Visão geral do condomínio',
    icon: House,
    route: '/inicio',
    group: 'principal',
    tab: true,
    roles: ALL,
  },
  {
    slug: 'financeiro',
    label: 'Financeiro',
    description: 'Boletos e 2ª via',
    icon: Receipt,
    route: '/financeiro',
    group: 'principal',
    tab: true,
    roles: ALL,
  },
  {
    slug: 'reservas',
    label: 'Reservas',
    description: 'Áreas comuns',
    icon: CalendarCheck2,
    route: '/reservas',
    group: 'principal',
    tab: true,
    roles: ALL,
  },
  {
    slug: 'ocorrencias',
    label: 'Ocorrências',
    description: 'Chamados por SLA',
    icon: TriangleAlert,
    route: '/ocorrencias',
    group: 'principal',
    tab: true,
    roles: ALL,
  },
  {
    slug: 'portaria',
    label: 'Portaria',
    description: 'Visitantes e encomendas',
    icon: DoorOpen,
    route: '/portaria',
    group: 'gestao',
    roles: ['sindico', 'morador', 'porteiro'],
  },
  {
    slug: 'comunicados',
    label: 'Comunicados',
    description: 'Avisos do condomínio',
    icon: Megaphone,
    route: '/comunicados',
    group: 'gestao',
    roles: ALL,
  },
  {
    slug: 'assembleia',
    label: 'Assembleia',
    description: 'Enquetes e votações',
    icon: Vote,
    route: '/assembleia',
    group: 'gestao',
    roles: ALL,
  },
  {
    slug: 'moradores',
    label: 'Moradores',
    description: 'Cadastro da unidade',
    icon: Users,
    route: '/moradores',
    group: 'gestao',
    roles: ALL,
  },
  {
    slug: 'manutencao',
    label: 'Manutenção',
    description: 'Ordens de serviço',
    icon: Wrench,
    route: '/manutencao',
    group: 'gestao',
    roles: ALL,
  },
  {
    slug: 'documentos',
    label: 'Documentos',
    description: 'Convenção, atas, balancetes',
    icon: FileText,
    route: '/documentos',
    group: 'servicos',
    roles: ALL,
  },
  {
    slug: 'veiculos',
    label: 'Veículos',
    description: 'Tags e cadastro',
    icon: Car,
    route: '/veiculos',
    group: 'addon',
    roles: ALL,
  },
  {
    slug: 'prestadores',
    label: 'Prestadores',
    description: 'Contratos e avaliação',
    icon: HardHat,
    route: '/prestadores',
    group: 'addon',
    roles: ALL,
  },
  {
    slug: 'funcionarios',
    label: 'Funcionários',
    description: 'Equipe do condomínio',
    icon: UserCog,
    route: '/funcionarios',
    group: 'addon',
    roles: ['sindico'],
  },
  {
    slug: 'pets',
    label: 'Pets',
    description: 'Carteira de vacinação',
    icon: PawPrint,
    route: '/pets',
    group: 'addon',
    roles: ALL,
  },
  {
    slug: 'marketplace-desapegos',
    label: 'Desapegos',
    description: 'Marketplace entre moradores',
    icon: ShoppingBag,
    route: '/marketplace',
    group: 'addon',
    roles: ALL,
  },
  {
    slug: 'lavanderia',
    label: 'Lavanderia',
    description: 'Ciclos e excedente',
    icon: WashingMachine,
    route: '/lavanderia',
    group: 'addon',
    roles: ALL,
  },
  {
    slug: 'piscina',
    label: 'Piscina',
    description: 'Acesso com atestado',
    icon: WavesLadder,
    route: '/piscina',
    group: 'exclusivo',
    roles: ALL,
    exclusive: true,
    requiredFeature: 'piscina-com-atestado',
  },
  {
    slug: 'garagem',
    label: 'Aluguel de garagem',
    description: 'Vagas rotativas entre empresas',
    icon: SquareParking,
    route: '/garagem',
    group: 'exclusivo',
    roles: ALL,
    exclusive: true,
    requiredFeature: 'garagem-rotativa-corporativa',
  },
  {
    slug: 'admin',
    label: 'Painel do Síndico',
    description: 'Aprovações e moderação',
    icon: ShieldCheck,
    route: '/admin',
    group: 'admin',
    roles: ['sindico'],
    alwaysOn: true,
  },
];

export function getModule(slug: string): ModuleDef | undefined {
  return MODULE_REGISTRY.find((m) => m.slug === slug);
}

/** O tenant habilita este módulo? (checa enabledModules + feature custom) */
export function isModuleAvailable(mod: ModuleDef, tenant: Tenant): boolean {
  if (mod.requiredFeature && !tenant.customFeatures.includes(mod.requiredFeature)) {
    return false;
  }
  if (mod.alwaysOn) return true;
  return tenant.enabledModules.includes(mod.slug);
}

/** O papel do usuário pode acessar este módulo? */
export function canRoleAccess(mod: ModuleDef, role: Role): boolean {
  const roles = mod.roles ?? ALL;
  return roles.includes(role);
}

/** Módulos visíveis para (tenant + papel), na ordem do registro. */
export function modulesFor(tenant: Tenant, role: Role): ModuleDef[] {
  return MODULE_REGISTRY.filter(
    (m) => isModuleAvailable(m, tenant) && canRoleAccess(m, role),
  );
}

/** Módulos que viram abas principais (morador/síndico). */
export function tabModulesFor(tenant: Tenant, role: Role): ModuleDef[] {
  return modulesFor(tenant, role).filter((m) => m.tab);
}

/** Módulos que aparecem na grade "Mais" (não-abas, exceto admin). */
export function gridModulesFor(tenant: Tenant, role: Role): ModuleDef[] {
  return modulesFor(tenant, role).filter((m) => !m.tab && m.group !== 'admin');
}
