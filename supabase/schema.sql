-- supabase/schema.sql
-- Schema do Banco de Dados — Sistema NEPLE Oral (Fatec Franco da Rocha)

-- 1. Tabela de Alunos Ingressantes
create table if not exists alunos (
  id uuid default gen_random_uuid() primary key,
  ra text not null unique,
  nome text not null,
  email text not null,
  curso text not null,
  semestre text not null, -- ex: '2026-2'
  created_at timestamptz default now()
);

-- 2. Tabela de Professores Avaliadores
create table if not exists avaliadores (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null unique,
  titulacao text default 'Mestre',
  idioma text default 'EN',
  created_at timestamptz default now()
);

-- 3. Horários e Slots de Disponibilidade dos Avaliadores
create table if not exists disponibilidades (
  id uuid default gen_random_uuid() primary key,
  avaliador_id uuid references avaliadores(id) on delete cascade,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  sala text default 'Sala NEPLE 02',
  ocupado boolean default false,
  created_at timestamptz default now()
);

-- 4. Agendamentos e Bancas de Prova Oral
create table if not exists provas (
  id uuid default gen_random_uuid() primary key,
  aluno_id uuid references alunos(id) on delete cascade,
  avaliador_id uuid references avaliadores(id) on delete set null,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  sala text not null default 'Sala NEPLE 02',
  status text not null default 'agendada', -- agendada | confirmada | recusada | concluida | cancelada | nao_compareceu
  token_confirmacao text unique default encode(gen_random_bytes(16), 'hex'),
  justificativa_recusa text,
  lembrete_enviado boolean default false,
  semestre text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Notas e Registros de Proficiência
create table if not exists notas (
  id uuid default gen_random_uuid() primary key,
  prova_id uuid references provas(id) on delete cascade unique,
  nota numeric(4,2) check (nota >= 0 and nota <= 10),
  nivel_proficiencia text check (nivel_proficiencia in ('A1','A2','B1','B2','C1','C2')),
  observacoes text,
  created_at timestamptz default now()
);

-- 6. View Detalhada de Provas
create or replace view v_provas_detalhadas as
select
  p.id,
  p.aluno_id,
  a.nome as aluno_nome,
  a.email as aluno_email,
  a.ra,
  a.curso,
  p.avaliador_id,
  av.nome as avaliador_nome,
  p.data,
  p.hora_inicio,
  p.hora_fim,
  p.sala,
  p.status,
  p.token_confirmacao,
  p.justificativa_recusa,
  p.semestre,
  p.created_at,
  p.updated_at,
  n.nota,
  n.nivel_proficiencia,
  n.observacoes
from provas p
left join alunos a on a.id = p.aluno_id
left join avaliadores av on av.id = p.avaliador_id
left join notas n on n.prova_id = p.id;

-- 7. Ativação de Row Level Security (RLS)
alter table alunos enable row level security;
alter table avaliadores enable row level security;
alter table disponibilidades enable row level security;
alter table provas enable row level security;
alter table notas enable row level security;

-- Políticas de RLS
create policy "Acesso completo para autenticados em alunos" on alunos
  for all to authenticated using (true) with check (true);

create policy "Acesso completo para autenticados em avaliadores" on avaliadores
  for all to authenticated using (true) with check (true);

create policy "Acesso completo para autenticados em disponibilidades" on disponibilidades
  for all to authenticated using (true) with check (true);

create policy "Acesso completo para autenticados em provas" on provas
  for all to authenticated using (true) with check (true);

create policy "Acesso completo para autenticados em notas" on notas
  for all to authenticated using (true) with check (true);

-- Leitura pública por token na tabela provas
create policy "Leitura publica de provas por token" on provas
  for select to anon using (true);

create policy "Atualizacao publica de provas por token" on provas
  for update to anon using (true) with check (true);
