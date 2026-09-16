# PLANO DE DESENVOLVIMENTO — Sistema NEPLE Oral
## Tarefas Independentes | Stack: HTML5 + Tailwind + Alpine.js + Supabase

---

## Diretrizes Gerais de UI/UX

1. **Interface limpa e profissional**: Layout sem poluição visual. Espaçamento consistente (Tailwind spacing scale: 4, 6, 8, 12, 16).
2. **Cores neutras**: Base `slate` (cinza azulado) para textos e fundos. `indigo` ou `emerald` como cor de destaque primária (máximo 1 cor de ação). Evitar gradientes, sombras excessivas e bordas coloridas.
3. **Otimização de espaço**: Tabelas compactas com `text-sm`, cards com informação essencial visível, colapsar detalhes secundários. Sidebar fixa ou topbar minimalista.
4. **Sem emojis**: Utilizar exclusivamente ícones da biblioteca **Phosphor Icons** (`<i class="ph ph-user"></i>`). Ícones em peso `regular` ou `bold`, tamanho `text-lg` ou `text-xl`.
5. **Tipografia**: Fonte Inter (Google Fonts), hierarquia clara (`text-xs` para labels, `text-sm` para dados, `text-base` para títulos de card, `text-2xl` para page headers).
6. **Feedback visual**: Estados de loading via spinner CSS (Tailwind `animate-spin`), toasts de notificação no canto superior direito, botões desabilitados com `opacity-50 cursor-not-allowed`.
7. **Responsividade**: Mobile-first. Tabelas com scroll horizontal em telas pequenas. Modais fullscreen em mobile, centralizados em desktop.
8. **Acessibilidade**: Contraste mínimo WCAG AA, foco visível em inputs (`ring-2 ring-indigo-500`), labels associados a todos os campos de formulário.

---

## Instruções para o Agente de IA

> **REGRA CRÍTICA 1 — BACKLOG DE ALTERAÇÕES**
> SEMPRE que você (o agente de IA) realizar qualquer correção, ajuste, refatoração, mudança de requisito, alteração de nome de variável, modificação de estrutura de dados ou qualquer desvio da SPEC original, você DEVE registrar essa alteração em um arquivo chamado `BACKLOG.md` na raiz do projeto, com o seguinte formato:
> ```markdown
> ## [DATA] — [TIPO: Correção | Ajuste | Alteração | Dúvida]
> - **Arquivo afetado:** `caminho/do/arquivo`
> - **Descrição:** O que foi alterado e por quê.
> - **Decisão tomada:** Justificativa técnica ou de negócio.
> - **Status:** Resolvido | Pendente validação
> ```
> NUNCA omita uma alteração do BACKLOG. Isso garante rastreabilidade e evita regressões.

> **REGRA CRÍTICA 2 — INTERAÇÃO HUMANA**
> Quando houver qualquer dúvida sobre requisitos de negócio, comportamento esperado, prioridade de funcionalidade, conflito entre instruções, ambiguidade na SPEC, ou decisão de arquitetura que impacte o escopo, você DEVE parar a execução e solicitar interação humana. Não suponha. Não "chute". Exemplos de situações que exigem interação humana:
> - A SPEC diz uma coisa e o usuário pediu outra na conversa atual.
> - Não há clareza sobre qual tela deve ser exibida após uma ação.
> - Existe mais de uma forma tecnicamente válida de implementar, com trade-offs significativos.
> - O usuário solicitou uma funcionalidade que está marcada como "Fora do Escopo" na SPEC.
> - Erro do Supabase que não é resolvido com retry ou tratamento padrão.

> **REGRA CRÍTICA 3 — INDEPENDÊNCIA DE TAREFAS**
> Cada tarefa abaixo foi projetada para ser desenvolvida e testada isoladamente. Se uma tarefa começar a depender de outra para funcionar, isso é um sinal de acoplamento incorreto. Neste caso, registre no BACKLOG e solicite interação humana para decidir se cria-se um mock/stub ou se as tarefas devem ser sequenciadas.

---

## T0 — Setup do Projeto e Contratos
**Independente:** Sim (base para todas, mas não bloqueia desenvolvimento com mocks)

### Entregáveis
- [ ] Estrutura de pastas conforme SPEC (`js/services/`, `js/components/`, `pages/`)
- [ ] `js/config.js` com variáveis de ambiente (URL e KEY do Supabase)
- [ ] `js/supabase-client.js` — singleton do cliente Supabase
- [ ] `index.html` com CDN carregados (Tailwind, Alpine, Phosphor, Inter)
- [ ] `js/mocks.js` — dados fictícios para desenvolvimento paralelo (5 alunos, 2 avaliadores, 3 provas)
- [ ] Definição dos contratos de interface dos Services (assinaturas das funções, sem implementação)

### Contratos de Service (interface estável)
```javascript
// js/services/alunos.js
export const AlunoService = {
  async listar() { /* retorna Promise<Array> */ },
  async importarCSV(csvText) { /* retorna Promise<{ inseridos, erros }> */ },
};

// js/services/avaliadores.js
export const AvaliadorService = {
  async listar() { /* retorna Promise<Array> */ },
  async criar(dados) { /* retorna Promise<Object> */ },
  async listarDisponibilidades(avaliadorId) { /* retorna Promise<Array> */ },
  async criarDisponibilidade(dados) { /* retorna Promise<Object> */ },
};

// js/services/provas.js
export const ProvaService = {
  async listar(filtros) { /* retorna Promise<Array> */ },
  async agendar(prova) { /* retorna Promise<Object> */ },
  async confirmarToken(token, resposta, justificativa) { /* retorna Promise<Object> */ },
  async reagendar(provaId, novosDados) { /* retorna Promise<Object> */ },
};

// js/services/notas.js
export const NotaService = {
  async registrar(dados) { /* retorna Promise<Object> */ },
  async obterPorProva(provaId) { /* retorna Promise<Object|null> */ },
};
```

---

## T1 — Schema e Segurança do Supabase
**Independente:** Sim (pode ser executado em paralelo com T2-T12 usando mocks)

### Entregáveis
- [ ] Script SQL completo de criação das tabelas (`alunos`, `avaliadores`, `disponibilidades`, `provas`, `notas`)
- [ ] View `v_provas_detalhadas`
- [ ] Ativação de RLS em todas as tabelas
- [ ] Políticas RLS para `authenticated` (full access) e `anon` (select por token)
- [ ] Teste de conexão: inserção e leitura via SQL Editor do Supabase

### Critério de Pronto
- O schema pode ser recriado do zero rodando um único script SQL.
- RLS está ativo e testado (usuário anon não consegue listar provas sem token; authenticated consegue).

---

## T2 — Implementação dos Services (Modo Real)
**Independente:** Sim (usa T1 se disponível; se não, registra no BACKLOG e aguarda)

### Entregáveis
- [ ] `js/services/alunos.js` — implementação real com Supabase
- [ ] `js/services/avaliadores.js` — implementação real com Supabase
- [ ] `js/services/provas.js` — implementação real com Supabase
- [ ] `js/services/notas.js` — implementação real com Supabase
- [ ] Tratamento de erro padronizado em todos os services

### Critério de Pronto
- Cada service funciona isoladamente testável via console do navegador.
- Erros do Supabase são capturados e relançados com mensagem em português.

---

## T3 — Componentes UI Reutilizáveis
**Independente:** Sim (usa apenas HTML + Tailwind + Alpine, sem dados reais)

### Entregáveis
- [ ] **Toast** (`js/components/toast.js`): Componente Alpine `toast()` que exibe mensagens temporárias (sucesso, erro, info). Auto-dismiss em 4s. Máximo 3 toasts visíveis.
- [ ] **Modal** (`js/components/modal.js`): Componente Alpine `modal()` com overlay, foco trap, fechamento via ESC e clique fora. Aceita título e conteúdo dinâmico via slot.
- [ ] **Tabela** (`js/components/table.js`): Componente Alpine `dataTable()` que recebe array de dados e config de colunas. Suporta ordenação por coluna e busca textual simples.
- [ ] **Spinner** (`js/components/spinner.js`): SVG animado para estados de loading.
- [ ] **ConfirmDialog** (`js/components/confirm.js`): Modal de confirmação com ações Sim/Não.

### Critério de Pronto
- Cada componente possui um HTML de demonstração isolado que pode ser aberto no navegador para teste visual.
- Zero dependência de dados do Supabase.

---

## T4 — Tela de Login / Autenticação
**Independente:** Sim (usa apenas Supabase Auth; não depende de outras telas)

### Entregáveis
- [ ] Formulário de login com e-mail e senha (ou Magic Link, conforme configurado no Supabase)
- [ ] Estado de loading no botão de submit
- [ ] Exibição de erro de autenticação via Toast
- [ ] Redirecionamento para Dashboard após login bem-sucedido
- [ ] Verificação de sessão ativa: se já logado, pula login e vai direto ao Dashboard
- [ ] Logout funcional

### Critério de Pronto
- Usuário consegue fazer login e logout. Sessão persiste no localStorage do Supabase.

---

## T5 — Layout Base e Navegação
**Independente:** Sim (estrutura visual vazia, apenas navegação entre seções)

### Entregáveis
- [ ] Sidebar responsiva (colapsa em mobile para hamburger menu)
- [ ] Topbar com título da página atual, nome do usuário logado e botão de logout
- [ ] Área de conteúdo principal (`<main>`) que alterna entre seções via Alpine (`x-show`)
- [ ] Menu de navegação: Dashboard, Alunos, Avaliadores, Agendar, Relatórios
- [ ] Item de menu ativo destacado visualmente

### Critério de Pronto
- Navegação entre seções funciona sem recarregar a página. Layout adapta-se a mobile e desktop.

---

## T6 — Dashboard com Cards e Visão Geral
**Independente:** Sim (pode consumir mocks de T0; substitui por T2 quando pronto)

### Entregáveis
- [ ] 5 cards de estatísticas: Total de Alunos | Provas Agendadas | Confirmadas | Concluídas | Pendentes
- [ ] Tabela de provas recentes (últimas 10) com colunas: Aluno, Data, Hora, Avaliador, Status
- [ ] Filtros rápidos: "Este semestre", "Hoje", "Pendentes"
- [ ] Badge de status colorido (agendada=cinza, confirmada=verde, recusada=vermelho, concluída=azul)
- [ ] Botão "Agendar Nova Prova" que abre modal da T9

### Critério de Pronto
- Dashboard exibe dados (reais ou mockados) e responde a filtros. Layout otimizado para visualização rápida.

---

## T7 — Gestão de Alunos e Importação CSV
**Independente:** Sim (pode usar mocks; não depende de outras telas funcionarem)

### Entregáveis
- [ ] Tabela de alunos com busca por nome ou RA
- [ ] Botão "Importar CSV" que abre input de arquivo
- [ ] Parsing do CSV (delimitador `;` ou `,`, encoding UTF-8)
- [ ] Preview dos dados antes da importação (primeiras 5 linhas)
- [ ] Validação: RA duplicado, e-mail inválido, campo vazio
- [ ] Inserção em lote via upsert (atualiza existente, insere novo)
- [ ] Toast com resumo: "X alunos importados, Y erros"
- [ ] (Opcional) Botão para download de template CSV

### Critério de Pronto
- Arquivo CSV de exemplo com 5 alunos é importado corretamente. Erros são reportados linha a linha.

---

## T8 — Gestão de Avaliadores e Disponibilidade
**Independente:** Sim (pode usar mocks)

### Entregáveis
- [ ] Tabela de avaliadores com nome e e-mail
- [ ] Formulário para adicionar novo avaliador
- [ ] Tela/Modal de disponibilidade por avaliador:
  - Grid de datas (próximos 14 dias)
  - Horários pré-definidos (ex: 08:00, 09:00, 10:00...)
  - Checkbox para marcar slot como disponível
- [ ] Slots já ocupados por provas agendadas aparecem desabilitados
- [ ] Salvamento da disponibilidade

### Critério de Pronto
- Avaliador pode ter múltiplos slots de disponibilidade cadastrados. Slots ocupados não são editáveis.

---

## T9 — Agendamento de Prova
**Independente:** Sim (pode usar mocks dos services de aluno e avaliador)

### Entregáveis
- [ ] Wizard em 3 passos (ou formulário único se mais simples):
  1. Seleção do aluno (busca com debounce, lista filtrável)
  2. Seleção do avaliador + data/hora (baseado em disponibilidades não ocupadas)
  3. Confirmação: resumo da prova + botão "Agendar"
- [ ] Validação: aluno sem prova ativa no mesmo semestre, slot não ocupado
- [ ] Ao agendar: status = 'agendada', token gerado automaticamente
- [ ] Após agendamento: opção de "Copiar link de convocação" ou "Enviar e-mail" (se T13 pronta)
- [ ] Se T13 não estiver pronta: exibir modal com texto do e-mail pronto para cópia manual

### Critério de Pronto
- Prova é criada no banco (ou mock) com todos os dados vinculados. Token único é gerado.

---

## T10 — Página Pública de Confirmação de Presença
**Independente:** Sim (totalmente desacoplada; não requer login; usa apenas token na URL)

### Entregáveis
- [ ] Página `pages/confirmar.html` (arquivo separado, sem sidebar)
- [ ] Leitura do parâmetro `?token=` da URL
- [ ] Busca da prova pelo token (acesso anônimo via RLS)
- [ ] Exibição dos dados: nome do aluno, data, hora, sala, avaliador
- [ ] Botão "Confirmar Presença" → status = 'confirmada'
- [ ] Botão "Recusar" → abre textarea para justificativa → status = 'recusada'
- [ ] Mensagem de sucesso/erro após ação
- [ ] Layout limpo, sem elementos de navegação interna

### Critério de Pronto
- Link com token válido exibe dados corretos e permite confirmar/recusar. Token inválido mostra mensagem de erro amigável.

---

## T11 — Registro de Notas
**Independente:** Sim (pode usar mocks; depende apenas da existência de uma prova)

### Entregáveis
- [ ] Acesso via ação na tabela de provas (botão "Registrar Nota" visível apenas para provas concluídas/não avaliadas)
- [ ] Modal com formulário:
  - Nota: input number (0 a 10, step 0.5)
  - Nível de proficiência: select (A1, A2, B1, B2, C1, C2)
  - Observações: textarea opcional
- [ ] Validação: nota entre 0 e 10
- [ ] Salvamento vinculado ao `prova_id`
- [ ] Após salvar: nota exibida na tabela de provas

### Critério de Pronto
- Nota é registrada e aparece no dashboard. Tentativa de nota inválida é bloqueada no frontend.

---

## T12 — Relatórios e Exportação CSV
**Independente:** Sim (pode usar mocks)

### Entregáveis
- [ ] Filtros: semestre, status, avaliador, período de datas
- [ ] Tabela de resultados filtrada
- [ ] Cards de KPI: taxa de comparecimento, média de notas, total por nível de proficiência
- [ ] Botão "Exportar CSV": gera arquivo com dados filtrados, nomeado `relatorio_nesple_YYYY-MM-DD.csv`
- [ ] CSV com delimitador `;` e encoding UTF-8-BOM (para Excel em PT-BR)

### Critério de Pronto
- Filtros funcionam. CSV gerado abre corretamente no Excel/LibreOffice com acentuação preservada.

---

## T13 — Edge Function de Envio de E-mail (Opcional)
**Independente:** Sim (não bloqueia nenhuma outra tarefa; fallback de cópia manual já previsto)

### Entregáveis
- [ ] Edge Function `enviar-convocacao` em Deno/TypeScript
- [ ] Template HTML do e-mail de convocação (sem estilos inline complexos, table-based para compatibilidade)
- [ ] Integração com serviço de e-mail (Resend, SendGrid ou SMTP via Supabase Secrets)
- [ ] Endpoint recebe `prova_id` e dispara e-mail para o aluno
- [ ] Registro de log da tentativa de envio

### Critério de Pronto
- Chamada à edge function resulta no recebimento do e-mail de teste na caixa de entrada.

---

## T14 — Integração, Testes Finais e Ajustes
**Dependente:** Sim (requer T0 a T12 concluídos)

### Entregáveis
- [ ] Remoção do modo mock (`js/mocks.js` desabilitado ou removido)
- [ ] Teste end-to-end: importar aluno → cadastrar avaliador → definir disponibilidade → agendar prova → copiar link → confirmar presença → registrar nota → exportar relatório
- [ ] Revisão de todos os toasts de erro (mensagens claras em português)
- [ ] Revisão de responsividade em telas de 320px a 1920px
- [ ] Revisão do BACKLOG.md: todas as alterações documentadas?

### Critério de Pronto
- Fluxo completo funciona sem erros. BACKLOG.md está atualizado.

---

## Mapa de Dependências (Resumo)

```
T0 (Setup + Contratos + Mocks)
├── T1 (Schema SQL) ──────┐
├── T2 (Services Real) ───┤
├── T3 (Componentes UI) ──┤
├── T4 (Login) ───────────┤
├── T5 (Layout) ──────────┤
├── T6 (Dashboard) ───────┤
├── T7 (Alunos) ──────────┤
├── T8 (Avaliadores) ─────┤
├── T9 (Agendar) ─────────┤
├── T10 (Confirmar) ──────┤  ← Totalmente independente
├── T11 (Notas) ──────────┤
├── T12 (Relatórios) ─────┤
├── T13 (Edge Function) ──┤  ← Opcional, independente
└─────────────────────────┘
         │
         ▼
    T14 (Integração)
```

**Nota:** As tarefas T1 a T13 podem ser desenvolvidas em paralelo desde que:
1. O contrato de interface dos Services (definido em T0) seja respeitado.
2. O modo mock esteja ativo para tarefas que ainda não têm o backend real (T1/T2).
3. T10 é a única tarefa 100% desacoplada — não requer login, não compartilha layout, não depende de estado da SPA.

---

## Registro de Alterações (BACKLOG Modelo)

```markdown
# BACKLOG — Sistema NEPLE Oral

## [2026-09-02] — Setup Inicial
- **Arquivo afetado:** Todos
- **Descrição:** Criação do plano de desenvolvimento com tarefas independentes.
- **Decisão tomada:** Uso de mocks para permitir paralelismo máximo.
- **Status:** Resolvido
```
