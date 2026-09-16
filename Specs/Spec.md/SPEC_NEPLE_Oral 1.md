# SPEC TÉCNICA — Sistema NEPLE Oral
## Convocação e Agendamento de Prova Oral | Fatec Franco da Rocha

**Versão:** 1.0  
**Stack:** HTML5 + Tailwind CSS + Alpine.js + Vanilla JS + Supabase  
**Padrão:** Single Page Application (SPA) estática, sem build step  
**Deploy:** Supabase Static Hosting / Vercel / Netlify (ou GitHub Pages com Supabase remoto)

---

## 1. Visão Geral da Arquitetura

Arquitetura **serverless** com frontend estático e backend gerenciado pelo Supabase.

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Browser       │──────│   Supabase       │──────│   PostgreSQL    │
│  (HTML+Alpine)  │  JS  │  (Auth + REST)   │ SQL  │   (Row Level    │
│                 │      │                  │      │   Security)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │
        └─────────────────────────┘
              Edge Functions (Deno)
              - envio de e-mail
              - geração de tokens
```

**Princípio:** Todo estado persistente vive no Supabase. O frontend é stateless, exceto por estado local de UI (Alpine.js).

---

## 2. Stack e Bibliotecas

| Tecnologia | Origem | Justificativa |
|------------|--------|---------------|
| **HTML5** | Nativo | Estrutura semântica, zero dependência |
| **Tailwind CSS v3** | CDN `cdn.tailwindcss.com` | Utility-first, sem arquivo CSS customizado, responsivo por padrão |
| **Alpine.js v3** | CDN `unpkg.com/alpinejs` | 15kb, reatividade declarativa via atributos HTML (`x-data`, `x-show`), substitui React/Vue sem build |
| **Supabase JS v2** | CDN `unpkg.com/@supabase/supabase-js` | Cliente oficial, realtime subscriptions, auth |
| **Phosphor Icons** | CDN `unpkg.com/@phosphor-icons/web` | Ícones SVG leves, sem font-face |
| **Google Fonts (Inter)** | CDN `fonts.googleapis.com` | Tipografia institucional, 1 requisição |

**NÃO utilizar:** React, Vue, Angular, jQuery, Webpack, Vite, Bootstrap, Sass/Less.

---

## 3. Estrutura de Arquivos

```
/
├── index.html              # Login / Dashboard (SPA principal)
├── css/
│   └── (vazio — Tailwind via CDN)
├── js/
│   ├── app.js              # Inicialização Alpine + Supabase
│   ├── config.js           # Variáveis de ambiente (URL e KEY)
│   ├── store.js            # Estado global Alpine (aluno, provas, toast)
│   ├── supabase-client.js  # Singleton do cliente Supabase
│   ├── services/
│   │   ├── alunos.js       # CRUD alunos
│   │   ├── avaliadores.js  # CRUD avaliadores
│   │   ├── provas.js       # Agendamento e status
│   │   └── notas.js        # Registro de avaliação
│   └── components/
│       ├── modal.js        # Componente modal reutilizável
│       ├── toast.js        # Notificações temporárias
│       └── table.js        # Tabela com ordenação/filtro
├── pages/                  # (Opcional) HTMLs separados para rotas simples
│   ├── confirmar.html      # Pública — confirmação de presença via token
│   └── relatorio.html      # Protegida — dashboard de KPIs
└── assets/
    └── logo-fatec.svg
```

---

## 4. Configuração de Ambiente (`js/config.js`)

```javascript
// js/config.js
export const SUPABASE_URL = 'https://<SEU-PROJETO>.supabase.co';
export const SUPABASE_ANON_KEY = '<SUA-ANON-KEY>';
export const APP_NAME = 'NEPLE Oral';
```

> **Agente:** Nunca hardcode credenciais em outros arquivos. Importar sempre de `config.js`.

---

## 5. Modelo de Dados (Supabase Schema)

### 5.1 Tabelas

```sql
-- Alunos ingressos
create table alunos (
  id uuid default gen_random_uuid() primary key,
  ra text not null unique,
  nome text not null,
  email text not null,
  curso text not null,
  semestre text not null, -- ex: '2026-2'
  created_at timestamptz default now()
);

-- Professores avaliadores
create table avaliadores (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- Horários disponíveis dos avaliadores
create table disponibilidades (
  id uuid default gen_random_uuid() primary key,
  avaliador_id uuid references avaliadores(id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  ocupado boolean default false,
  created_at timestamptz default now()
);

-- Agendamentos de prova
create table provas (
  id uuid default gen_random_uuid() primary key,
  aluno_id uuid references alunos(id) on delete cascade,
  avaliador_id uuid references avaliadores(id) on delete set null,
  data date not null,
  hora_inicio time not null,
  sala text not null default 'Sala NEPLE',
  status text not null default 'agendada', -- agendada | confirmada | recusada | concluida | cancelada | nao_compareceu
  token_confirmacao text unique default encode(gen_random_bytes(16), 'hex'),
  justificativa_recusa text,
  lembrete_enviado boolean default false,
  semestre text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notas e proficiência
create table notas (
  id uuid default gen_random_uuid() primary key,
  prova_id uuid references provas(id) on delete cascade,
  nota numeric(4,2) check (nota >= 0 and nota <= 10),
  nivel_proficiencia text check (nivel_proficiencia in ('A1','A2','B1','B2','C1','C2')),
  observacoes text,
  created_at timestamptz default now()
);

-- View para dashboard
create view v_provas_detalhadas as
select 
  p.*,
  a.nome as aluno_nome,
  a.email as aluno_email,
  a.ra,
  av.nome as avaliador_nome,
  n.nota,
  n.nivel_proficiencia
from provas p
left join alunos a on a.id = p.aluno_id
left join avaliadores av on av.id = p.avaliador_id
left join notas n on n.prova_id = p.id;
```

### 5.2 Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
alter table alunos enable row level security;
alter table avaliadores enable row level security;
alter table disponibilidades enable row level security;
alter table provas enable row level security;
alter table notas enable row level security;

-- Políticas para usuários autenticados (coordenação/avaliadores)
create policy "Allow full access to authenticated users" on alunos
  for all to authenticated using (true) with check (true);

create policy "Allow full access to authenticated users" on avaliadores
  for all to authenticated using (true) with check (true);

create policy "Allow full access to authenticated users" on disponibilidades
  for all to authenticated using (true) with check (true);

create policy "Allow full access to authenticated users" on provas
  for all to authenticated using (true) with check (true);

create policy "Allow full access to authenticated users" on notas
  for all to authenticated using (true) with check (true);

-- Política pública para confirmação via token (anônimo)
create policy "Allow select by token" on provas
  for select to anon using (true); -- filtrado no app por token
```

> **Nota:** Como não há perfis de usuário diferenciados no MVP, `authenticated` engloba coordenação e avaliadores. A separação por avaliador_id é feita no frontend (filtro de dados).

---

## 6. Requisitos Funcionais Técnicos

### RF-01 Importação de Alunos
- Upload de arquivo CSV (parsing via PapaParse CDN ou regex simples).
- Inserção em lote via `supabase.from('alunos').upsert()` com `onConflict: 'ra'`.
- Validação: RA único, e-mail válido, campos obrigatórios preenchidos.

### RF-02 Cadastro de Avaliadores
- Formulário simples: nome, e-mail.
- `insert` na tabela `avaliadores`.

### RF-03 Disponibilidade
- Calendário visual (grid HTML + Alpine) mostrando dias/horários.
- Ao clicar em um slot, marca `ocupado = false` e vincula a uma prova.
- Slots ocupados ficam desabilitados (`bg-gray-300 cursor-not-allowed`).

### RF-04 Agendamento
- Select de aluno (busca com debounce de 300ms).
- Select de avaliador.
- Select de data/hora baseado em `disponibilidades` não ocupadas.
- Ao salvar: `insert` em `provas`, `update disponibilidades set ocupado = true`.

### RF-05 Convocação por E-mail
- Disparo via Supabase Edge Function `enviar-convocacao`.
- Payload: `{ prova_id, email_destino, template: 'convocacao' }`.
- O e-mail contém link: `https://<app>/confirmar.html?token=<TOKEN>`.

### RF-06 Confirmação Pública
- Rota pública `confirmar.html` (sem login).
- Lê `?token=XYZ`, busca `provas.token_confirmacao`.
- Exibe dados da prova e botões "Confirmar Presença" / "Recusar".
- Atualiza `status` para `confirmada` ou `recusada`.

### RF-07 Reagendamento
- Se status = `recusada` ou `nao_compareceu`, liberar slot anterior (`ocupado = false`).
- Permitir novo agendamento mantendo o mesmo `aluno_id`.

### RF-08 Registro de Notas
- Tela acessível apenas após `status = 'concluida'` (ou forçar via coordenação).
- Formulário: nota (0-10, step 0.5), nível (select A1-C2), observações.
- `insert` em `notas`.

### RF-09 Dashboard
- Cards: Total de alunos | Agendados | Confirmados | Avaliados | Pendentes.
- Tabela com filtros por semestre, status e avaliador.
- Exportar CSV via `Papa.unparse()` (client-side).

### RF-10 Lembretes
- Edge Function `enviar-lembrete` chamada manualmente ou via cron (pg_cron no Supabase).
- Seleciona provas onde `data = amanhã` e `lembrete_enviado = false`.

---

## 7. Padrões de Código

### 7.1 Alpine.js — Estrutura de Componente

```html
<!-- Exemplo: Card de Estatística -->
<div x-data="statCard()" class="bg-white rounded-lg shadow p-6">
  <h3 x-text="title" class="text-sm font-medium text-gray-500"></h3>
  <p x-text="value" class="mt-2 text-3xl font-bold text-gray-900"></p>
</div>

<script>
function statCard() {
  return {
    title: 'Alunos Convocados',
    value: 0,
    async init() {
      const { count } = await supabase.from('provas').select('*', { count: 'exact', head: true });
      this.value = count;
    }
  }
}
</script>
```

### 7.2 Supabase Client — Singleton

```javascript
// js/supabase-client.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 7.3 Serviços — Padrão Repository

```javascript
// js/services/provas.js
import { supabase } from '../supabase-client.js';

export const ProvaService = {
  async listar(filtros = {}) {
    let query = supabase.from('v_provas_detalhadas').select('*');
    if (filtros.semestre) query = query.eq('semestre', filtros.semestre);
    if (filtros.status) query = query.eq('status', filtros.status);
    const { data, error } = await query.order('data', { ascending: true });
    if (error) throw error;
    return data;
  },

  async agendar(prova) {
    const { data, error } = await supabase.from('provas').insert(prova).select().single();
    if (error) throw error;
    return data;
  },

  async confirmarToken(token, resposta, justificativa = null) {
    const status = resposta === 'sim' ? 'confirmada' : 'recusada';
    const update = { status, updated_at: new Date() };
    if (justificativa) update.justificativa_recusa = justificativa;

    const { data, error } = await supabase
      .from('provas')
      .update(update)
      .eq('token_confirmacao', token)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
```

---

## 8. Telas e Componentes UI

### 8.1 Layout Base (`index.html`)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEPLE Oral — Fatec Franco da Rocha</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;}</style>
</head>
<body class="bg-gray-50 text-gray-900" x-data="app()">
  <!-- Sidebar + Main Content -->
</body>
</html>
```

### 8.2 Telas Obrigatórias

| Tela | Rota | Acesso | Descrição |
|------|------|--------|-----------|
| Login | `/` | Público | Auth do Supabase (magic link ou senha) |
| Dashboard | `/` (pós-login) | Autenticado | Cards + tabela de provas |
| Alunos | Modal/Tela | Autenticado | Lista + importação CSV |
| Avaliadores | Modal/Tela | Autenticado | CRUD + disponibilidade |
| Agendar Prova | Modal | Autenticado | Wizard: aluno → avaliador → horário → confirmar |
| Registrar Nota | Modal | Autenticado | Formulário vinculado à prova selecionada |
| Confirmar Presença | `/confirmar.html?token=xxx` | Anônimo | Página pública de resposta do aluno |
| Relatórios | `/relatorio.html` | Autenticado | KPIs e exportação CSV |

---

## 9. Edge Functions (Supabase/Deno)

### 9.1 `enviar-convocacao`

```typescript
// supabase/functions/enviar-convocacao/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { prova_id } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: prova } = await supabase.from('v_provas_detalhadas').select('*').eq('id', prova_id).single();
  if (!prova) return new Response('Prova não encontrada', { status: 404 });

  const link = `${Deno.env.get('APP_URL')}/confirmar.html?token=${prova.token_confirmacao}`;

  // Integração com Resend (recomendado) ou SMTP
  // await fetch('https://api.resend.com/emails', { ... });

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
});
```

> **Alternativa sem serviço externo:** Gerar o corpo do e-mail em HTML e exibir em modal para cópia manual pelo coordenador (fallback garantido).

---

## 10. Segurança

| Camada | Implementação |
|--------|---------------|
| **Autenticação** | Supabase Auth (e-mail + senha ou Magic Link) |
| **Autorização** | RLS no PostgreSQL |
| **Dados sensíveis** | Tokens de confirmação gerados via `gen_random_bytes()` |
| **Validação** | Constraints CHECK no banco + validação no frontend |
| **HTTPS** | Obrigatório em produção (Supabase já fornece) |
| **CORS** | Configurar no Supabase apenas os domínios de produção |

---

## 11. Checklist de Entrega do MVP

- [ ] Schema criado no Supabase com RLS ativado
- [ ] Tela de login funcional (Supabase Auth)
- [ ] Importação CSV de alunos funcionando
- [ ] CRUD de avaliadores e disponibilidades
- [ ] Agendamento de prova com validação de conflito de horário
- [ ] Geração de token de confirmação único por prova
- [ ] Página pública `confirmar.html` respondendo corretamente ao token
- [ ] Dashboard com contadores e tabela filtrável
- [ ] Registro de notas vinculado à prova
- [ ] Exportação de CSV do relatório
- [ ] (Opcional) Edge Function de envio de e-mail configurada

---

## 12. Notas para o Agente de IA

1. **Nunca gere código que exija `npm install` ou `node_modules`.** Todas as dependências vêm de CDN via `import` ou `<script>`.
2. **Use `type="module"`** em todas as tags `<script>` do projeto.
3. **Prefira `async/await`** ao invés de `.then()` para legibilidade.
4. **Trate erros do Supabase** sempre com `if (error) { console.error(error); throw error; }`.
5. **Mantenha o estado no Alpine**, não em variáveis globais soltas.
6. **Use classes utilitárias do Tailwind**; evite CSS customizado exceto para `@keyframes` essenciais.
7. **Semântica HTML5 obrigatória:** `<main>`, `<section>`, `<table>`, `<button type="button">`, etc.
8. **Acessibilidade mínima:** `aria-label` em ícones, foco visível em inputs, contraste WCAG AA.
