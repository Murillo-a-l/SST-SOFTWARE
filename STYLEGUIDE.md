# Occupational Health UI Styleguide

## Paleta de cores
- **Fundo do app:** `#F4F6F8` / `#EEF1F4`
- **Superfícies:** Branco `#FFFFFF`, off-white `#F9FAFB`
- **Bordas:** `#D5D8DC`, `#E0E3E7`, `#C9CDD2`
- **Texto primário:** `#2F343A`
- **Texto secundário:** `#6B7480`
- **Labels/muted:** `#7B8EA3`
- **Destaques:**
  - Primário: `#3A6EA5` / `#2F5C8C`
  - Sucesso: `#79A88E`
  - Atenção: `#F6B980`
  - Perigo: `#D97777`
  - Tons retro sutis: `#E7E2D9`, `#C48A84`, `#8A5260`

## Tipografia
- Fonte base: **Inter**, fallback `system-ui, sans-serif`
- Label técnica: `text-xs uppercase tracking-[0.18em] text-[#7B8EA3]`
- Título de seção/card: `text-sm font-semibold text-slate-800`
- Corpo: `text-sm text-slate-800`
- Secundário: `text-xs text-slate-500`
- Métricas: `font-mono text-2xl text-[#2F5C8C]`

## Tokens (src/styles/tokens.ts)
- **spacing:** xs 4px, sm 8px, md 12px, lg 16px, xl 24px, xxl 32px
- **radius:** sm 6px, md 10px, lg 16px, xl 20px
- **colors:** bgApp, bgCard, bgMuted, border, borderSoft, borderMuted, textPrimary, textSecondary, textMuted, primary, primaryDark, success, warning, danger, retroSand, retroTerracotta, retroBordo
- **sombras:** `card`, `soft` leves e contidas

## Componentes base
- **Card** (`src/components/ui/Card.tsx`): `rounded-2xl border border-[#E0E3E7] bg-white shadow-card p-4`; aceita `title`, `subtitle`, `actions`, `className`.
- **Button** (`src/components/ui/Button.tsx`): variantes `primary`, `secondary`, `ghost`, `danger`; tamanhos `sm|md|lg`; transição `duration-200`, leve lift em hover.
- **Input** (`src/components/ui/Input.tsx`): borda suave, `rounded-lg`, foco com ring `primary/40`, `shadow-sm`.
- **Badge** (`src/components/ui/Badge.tsx`): chips arredondados, variantes `success|warning|danger|neutral`.
- **TableShell** (`src/components/ui/TableShell.tsx`): contêiner de tabela `rounded-2xl border bg-white shadow-sm`; cabeçalhos `tableHeaderCell`, células `tableCell`, hover `#F8FAFC`.
- **SectionHeader** (`src/components/ui/SectionHeader.tsx`): label + título + ações alinhadas.
- **AppIcon** (`src/components/ui/AppIcon.tsx`): ícones padronizados (`w-5 h-5`, cor `#6A7381`, ativa `#2F5C8C`).

## Padrões de layout
- **Sidebar:** largura 60/20 (expandida/colapsada), `bg-white`, borda direita, itens com estado ativo `bg-[#E8ECF0]` e barra `border-[#3A6EA5]`. Toggle inferior arredondado.
- **Header:** altura 64px, `bg-white` com `border-b`, seletor de contexto em chip claro, usuário/alertas à direita.
- **Dashboard:** `max-w-7xl` com `px-6 py-6`, cards em grid, ações rápidas em botões secundários arredondados, alertas em tons suaves.
- **Tabelas:** usar `TableShell`; cabeçalho `bg-[#F1F3F5]`, texto uppercase; linhas com borda inferior e hover suave; status via `Badge`.
- **Modais:** overlay `bg-black/20` com blur leve; container `bg-white rounded-2xl border-[#DADFE3] shadow-lg p-6`; inputs com `Input`; botões primário/secundário alinhados à direita.

## Microinterações
- Transições: `transition-all duration-200 ease-out` para botões, cards clicáveis, itens de navegação.
- Hover primário: leve elevação (`hover:-translate-y-[1px]`) e `shadow-sm`.
- Estados de foco: ring em tom `primary/30-40`, sem outlines bruscos.
- Ícones: centralizados via `AppIcon`, cor muda para `primaryDark` em ativo/hover.
