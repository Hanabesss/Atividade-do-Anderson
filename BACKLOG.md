# BACKLOG — Sistema NEPLE Oral

## [2026-09-02] — Ajuste e Unificação do Layout Google Stitch para SPA
- **Arquivo afetado:** `index.html`, `js/app.js`, `pages/confirmar.html`
- **Descrição:** Mapeamento e integração das 4 telas disponibilizadas em `theme/` para a SPA estática baseada em Alpine.js e Tailwind CSS via CDN.
- **Decisão tomada:** Manter unificação completa em Single Page Application (`index.html`), mantendo os componentes visuais idênticos ao design das interfaces do Google Stitch (Google Fonts Inter, Material Symbols Outlined e cores do Tailwind), com exceção da página pública de confirmação (`pages/confirmar.html`) que é totalmente desacoplada para acesso anônimo do discente por token.
- **Status:** Resolvido
