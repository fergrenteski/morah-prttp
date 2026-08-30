# Arquitetura — Linha de Produção de Software (SPL)

Este projeto não é "um app de condomínio". É uma **linha de produção**: um núcleo
reutilizável (`core`) que, alimentado por **variantes de configuração** (`tenants`),
gera apps diferentes para clientes diferentes **sem duplicar projeto**. Instanciar um
novo condomínio é *configuração*, não *desenvolvimento*.

```
┌──────────────────────────────────────────────────────────────┐
│                      NÚCLEO (core, reutilizável)               │
│  design-system · theme engine · module registry · rules       │
└──────────────────────────────────────────────────────────────┘
                 ▲                    ▲                    ▲
     configura   │        configura   │        configura   │
                 │                    │                    │
        ┌────────┴───────┐   ┌────────┴───────┐   ┌────────┴───────┐
        │  Faria Lima     │   │  Jardim das    │   │  (novo tenant  │
        │  Corporate.json │   │  Acacias.json  │   │   = novo .json)│
        └─────────────────┘   └────────────────┘   └────────────────┘
```

---

## Estrutura de pastas

```
/app                         → rotas (expo-router, file-based)
  (auth)/login.tsx           → login com 3 perfis mock
  (tabs)/_layout.tsx         → TAB BAR DINÂMICA por papel + módulos
  (tabs)/{inicio,financeiro,reservas,ocorrencias,portaria,modulos,perfil}.tsx
  boleto/[id].tsx            → detalhe do boleto (2ª via)
  ocorrencia/[id].tsx        → detalhe + comentários + encerrar
  {comunicados,assembleia,moradores,documentos,manutencao,...}.tsx
  {pets,marketplace,lavanderia,piscina}.tsx   → add-ons / exclusivos
  {veiculos,prestadores,garagem,funcionarios}.tsx
  admin/index.tsx            → Painel do Síndico (RBAC)
  dev/trocar-condominio.tsx  → troca de tenant ao vivo (modo demonstração)
  ui-kit.tsx                 → documentação viva do design system

/src
  /core
    /design-system           → 1. biblioteca de componentes (agnóstica de marca)
    /theme                    → 2. tokens + ThemeProvider (motor de temas)
    /navigation
      moduleRegistry.ts       → 4. registro de módulos / feature flags
    /state                    → tenantStore + sessionStore (Zustand)
  /features                   → domínios de negócio (organização por feature)
  /mocks
    /data                     → fixtures .json (pt-BR realistas)
    /repositories             → 3. contrato de dados abstrato + impl. mock
  /tenants                    → *.json + index.ts (catálogo de variantes)
  /shared
    /types                    → entidades de domínio (TS)
    /rules                    → 5. motor de regras parametrizável
    /utils, /hooks
```

---

## Regra de ouro do reuso

Nenhuma tela importa dados ou cores hard-coded. Toda tela:

1. lê o **tenant ativo** via `useTenant()` → marca, módulos, plano, regras;
2. lê o **papel do usuário** via `useSession()` → o que pode ver/fazer;
3. busca dados via **repositório** (`useRepositories()`) — nunca `fetch`/JSON direto.

A decisão de "módulo aparece ou não" é **centralizada** no `moduleRegistry`
(`isModuleAvailable` + `canRoleAccess`). Não existe `if (tenant.id === 'x')`
espalhado pelas telas.

---

## Os 6 ativos reutilizáveis da linha

### 1. Design System — `src/core/design-system`
Biblioteca de ~19 componentes (`Button`, `Card`, `StatusPill`, `Input`,
`BottomSheet`, `BrandHeader`, `Stat`, `ListItem`…). **Nenhuma cor de marca é
hard-coded**: todo componente lê `useTheme()`. As cores de *estado* (aprovado,
pendente, etc.) são semânticas e funcionam sobre qualquer marca. Documentado ao
vivo na tela **UI Kit**.

### 2. Motor de Temas + Schema de Tenant — `src/core/theme` + `src/tenants/*.json`
`tokens.ts` traz a escala base (espaçamento, raio, tipografia, status). O
`ThemeProvider` compõe *tokens + `brand` do tenant ativo* e injeta via Context.
O **schema `Tenant`** (`theme/types.ts`) é o contrato que qualquer cliente novo
preenche para "nascer" personalizado (marca, plano, módulos, regras).

### 3. Camada de Repositório Mock — `src/mocks/repositories`
Contrato de dados **abstrato** (interfaces `OcorrenciasRepository`,
`ReservasRepository`, `MoradoresRepository`) com implementação mock sobre
AsyncStorage, isolada por tenant. No dia do backend real, troca-se apenas a
implementação — **nenhuma tela muda**. Os 3 domínios acima têm CRUD completo;
os demais expõem a mesma forma de contrato (`createReadRepository` + mutações).

### 4. Registro de Módulos / Feature Flags — `src/core/navigation/moduleRegistry.ts`
Fonte **única** de verdade: cada módulo declara `slug`, rota, ícone, grupo,
`roles`, `requiredFeature` e se é `exclusive`. Alimenta a tab bar dinâmica, a
grade "Mais", os atalhos do dashboard e o gate de acesso.

### 5. Motor de Regras Parametrizável — `src/shared/rules/index.ts`
Regras de negócio recebem os **parâmetros do tenant** como argumento (nada
hard-coded): cálculo de **SLA** de ocorrência, **elegibilidade de reserva**
(antecedência mínima) e **excedente de lavanderia**. O mesmo cálculo serve
qualquer condomínio mudando só os parâmetros em `tenant.rules`.

### 6. Documentação viva — `ARQUITETURA.md` + tela **UI Kit**
Este documento + a tela interna que lista os componentes do design system
renderizados com o tema ativo, servindo de especificação para novos projetos da
linha.

---

## Variabilidade demonstrada

| Eixo | Como varia | Prova no protótipo |
|------|------------|--------------------|
| **Marca** | `brand.*` do tenant | Troca de condomínio re-temiza tudo |
| **Módulos** | `enabledModules` + `moduleRegistry` | Tab bar e grade "Mais" mudam |
| **Função exclusiva** | `customFeatures` + `requiredFeature` | Garagem (FL) × Piscina (JA) |
| **Papel (RBAC)** | `roles` no registro + `useSession` | Porteiro só vê Portaria; Painel só p/ síndico |
| **Regras** | `tenant.rules` no motor de regras | SLA e excedente diferentes por cliente |

### As duas funções exclusivas e como são separadas
- **Faria Lima → "Aluguel de garagem"** (`requiredFeature: garagem-rotativa-corporativa`).
- **Jardim das Acácias → "Piscina com atestado"** (`requiredFeature: piscina-com-atestado`).

A separação é declarativa no `moduleRegistry`: o módulo só é visível se
`tenant.customFeatures` contém a feature exigida. Ao trocar de tenant, o módulo
some/aparece sozinho — sem nenhuma condição por-id nas telas.

---

## Como estender a linha (pontos de variação)

- **Novo condomínio** → crie `src/tenants/<cliente>.json` e registre em
  `src/tenants/index.ts`. (RNF-09)
- **Novo módulo** → crie a tela em `/app` e uma entrada em `moduleRegistry.ts`.
  Nada nos módulos existentes muda. (RNF-08)
- **Backend real** → implemente as interfaces de `src/mocks/repositories`
  apontando para a API; as telas permanecem idênticas. (RNF-05)

---

## Stack
Expo SDK 57 · React Native 0.86 · React 19 · TypeScript · expo-router ·
Zustand · AsyncStorage · lucide-react-native · Public Sans + IBM Plex Mono.
