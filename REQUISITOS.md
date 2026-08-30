# Requisitos — Protótipo de Gestão Condominial (SPL)

Protótipo navegável de alta fidelidade, multi-tenant, com dados mockados e
arquitetura de **Linha de Produção de Software (Software Product Line)**.

---

## Requisitos Funcionais (RF)

| #   | Requisito | Onde é atendido |
|-----|-----------|-----------------|
| RF-01 | Login com 3 perfis distintos (síndico, morador, porteiro) | `app/(auth)/login.tsx`, `src/core/state/sessionStore.ts` |
| RF-02 | Exibir apenas os módulos habilitados para o tenant ativo | `moduleRegistry.ts`, `app/(tabs)/_layout.tsx`, `app/(tabs)/modulos.tsx` |
| RF-03 | Alternar entre condomínios (modo demonstração) | `app/dev/trocar-condominio.tsx`, `tenantStore.ts` |
| RF-04 | Criar, listar, editar e cancelar reservas de área comum | `app/(tabs)/reservas.tsx`, `reservas.repository.ts` |
| RF-05 | Abrir, listar, comentar e encerrar ocorrências | `app/(tabs)/ocorrencias.tsx`, `app/ocorrencia/[id].tsx`, `ocorrencias.repository.ts` |
| RF-06 | Ordenar ocorrências por violação de SLA | `src/shared/rules/index.ts` (`pesoSla`), tela de ocorrências |
| RF-07 | Cadastrar, editar e remover moradores/dependentes da unidade | `app/moradores.tsx`, `moradores.repository.ts` |
| RF-08 | Exibir boletos financeiros com 2ª via | `app/(tabs)/financeiro.tsx`, `app/boleto/[id].tsx` |
| RF-09 | Registrar visitantes esperados na portaria | `app/(tabs)/portaria.tsx` (`createVisitante`) |
| RF-10 | Registrar retirada de encomendas | `app/(tabs)/portaria.tsx` (`retirarEncomenda`) |
| RF-11 | Votação em enquetes/assembleias com resultado agregado | `app/assembleia.tsx` (`votar`) |
| RF-12 | Exibir documentos (convenção, atas, balancetes) | `app/documentos.tsx` |
| RF-13 | Cadastro de pets com carteira de vacinação (quando habilitado) | `app/pets.tsx` (add-on Jardim das Acácias) |
| RF-14 | Anúncio de vagas de garagem entre unidades (quando habilitado) | `app/garagem.tsx` (exclusivo Faria Lima) |
| RF-15 | Painel administrativo exclusivo do síndico | `app/admin/index.tsx` (RBAC) |
| RF-16 | Moderação de itens no marketplace/desapegos pelo síndico | `app/marketplace.tsx`, `app/admin/index.tsx` |
| RF-17 | Cálculo de cobrança de excedente na lavanderia por ciclos | `app/lavanderia.tsx`, `rules/index.ts` (`calcularExcedenteLavanderia`) |

## Requisitos Não Funcionais (RNF)

| #    | Requisito | Como é garantido |
|------|-----------|------------------|
| RNF-01 | Rodar via Expo Go em iOS e Android sem configuração extra | Projeto Expo SDK 57 + expo-router; sem código nativo custom |
| RNF-02 | Troca de tenant re-temiza a UI em < 1s, sem reload | `tenantStore` (Zustand) reativo + `ThemeProvider` derivado |
| RNF-03 | Todos os textos em português (pt-BR) | Copy e formatação `pt-BR` (`shared/utils/format.ts`) |
| RNF-04 | UI 100% reutilizável entre módulos (sem estilo hard-coded por tela) | `src/core/design-system` — componentes leem `useTheme()` |
| RNF-05 | Nenhuma tela acessa dados mock diretamente — sempre via repositório | `src/mocks/repositories`, `useRepositories()` |
| RNF-06 | Área de toque mínima de 48px | `HIT_SLOP_MIN = 48` em `Button`, `ListItem`, `IconButton`… |
| RNF-07 | Estado local (AsyncStorage) entre sessões para o CRUD | `asyncStore.ts` + `persist` nos stores |
| RNF-08 | Adicionar novo módulo sem alterar módulos existentes | Registro declarativo em `moduleRegistry.ts` + rota isolada |
| RNF-09 | Adicionar novo tenant apenas criando um JSON | `src/tenants/*.json` + `src/tenants/index.ts` |
| RNF-10 | 100% TypeScript com tipos explícitos de domínio | `src/shared/types/index.ts`; `tsc --noEmit` limpo |

---

## Perfis de usuário (RBAC)

- **Síndico** — acesso total + `Painel do Síndico` (aprovações, moderação, SLA).
- **Morador** — módulos habilitados pelo tenant, sobre a própria unidade.
- **Porteiro** — acesso restrito à Portaria (visitantes e encomendas).

## Tenants de demonstração

- **Faria Lima Corporate** (comercial, plano completo) — função exclusiva **Aluguel de garagem**.
- **Jardim das Acácias** (residencial, básico + add-ons) — função exclusiva **Piscina com atestado**.
