# Gestão Condominial — Protótipo SPL

Protótipo mobile **navegável de ponta a ponta** (um "Figma vivo" em código real)
de um app de **gestão condominial multi-tenant**, arquitetado como **Linha de
Produção de Software**. Todas as telas são clicáveis, com CRUD simulado sobre
dados mockados — **sem backend**.

- 📐 Arquitetura e ativos reutilizáveis → [`ARQUITETURA.md`](ARQUITETURA.md)
- ✅ Requisitos funcionais e não funcionais → [`REQUISITOS.md`](REQUISITOS.md)

## Rodando no celular (Expo Go)

```bash
npm install --legacy-peer-deps
npx expo start
```

Escaneie o QR code com o app **Expo Go** (iOS/Android). Ou use um emulador:

```bash
npm run ios      # simulador iOS
npm run android  # emulador Android
```

> A flag `--legacy-peer-deps` é necessária por causa das dependências web do
> expo-router (react-dom/vaul). Não afeta o app nativo.

## Roteiro de demonstração (sugerido)

1. **Login** — entre como **Síndico**, **Morador** ou **Porteiro** (cada papel vê
   uma navegação diferente).
2. No topo do início (ou em Perfil), toque em **Trocar condomínio** e alterne
   entre *Faria Lima Corporate* e *Jardim das Acácias* — veja **marca, tab bar e
   módulos re-temizarem na hora**.
3. **Reservas / Ocorrências / Moradores** — CRUD completo (criar, editar, cancelar,
   comentar, encerrar). O estado persiste entre sessões (AsyncStorage).
4. **Ocorrências** ficam **ordenadas por SLA** (parametrizado por tenant).
5. Módulos **exclusivos**: *Aluguel de garagem* (só Faria Lima) e *Piscina com
   atestado* (só Jardim das Acácias) — na grade **Mais**.
6. Como **Síndico**, abra o **Painel do Síndico**: aprovar reservas, moderar
   desapegos, ver SLA vencido.
7. **Perfil → UI Kit** mostra o design system re-temizado pelo tenant ativo.

## Estrutura

```
app/    → rotas (expo-router)
src/core/design-system   → biblioteca de UI (agnóstica de marca)
src/core/theme           → tokens + ThemeProvider
src/core/navigation      → moduleRegistry (feature flags)
src/core/state           → tenantStore + sessionStore (Zustand)
src/mocks                → fixtures + repositórios mock (AsyncStorage)
src/tenants              → *.json (variantes por cliente)
src/shared               → types, rules (SLA/excedente), utils, hooks
```

Feito com Expo SDK 57 · React Native · TypeScript · Zustand.
