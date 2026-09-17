// js/mocks.js
export const mockAlunos = [
  { id: 'a1', ra: '2840482411001', nome: 'Ana Beatriz Mendonça de Souza', email: 'ana.souza18@fatec.sp.gov.br', curso: 'DSM', semestre: '2026-2', status_agendamento: 'agendada' },
  { id: 'a2', ra: '2840482411015', nome: 'Carlos Eduardo Albuquerque', email: 'carlos.albuquerque@fatec.sp.gov.br', curso: 'GTI', semestre: '2026-2', status_agendamento: 'concluida' },
  { id: 'a3', ra: '2840482411033', nome: 'Felipe Augusto Ramos da Cunha', email: 'felipe.cunha@fatec.sp.gov.br', curso: 'DSM', semestre: '2026-2', status_agendamento: 'sem_agendamento' },
  { id: 'a4', ra: '2840482411049', nome: 'Gabriela Martins Nogueira', email: 'gabriela.nogueira@fatec.sp.gov.br', curso: 'COMEX', semestre: '2026-2', status_agendamento: 'sem_agendamento' },
  { id: 'a5', ra: '2840482411062', nome: 'Henrique Torres Santana', email: 'henrique.santana@fatec.sp.gov.br', curso: 'GPI', semestre: '2026-2', status_agendamento: 'agendada' },
  { id: 'a6', ra: '1430962323019', nome: 'Mariana Ribeiro Guimarães', email: 'mariana.guimaraes@fatec.sp.gov.br', curso: 'GTI', semestre: '2026-2', status_agendamento: 'agendada' }
];

export const mockAvaliadores = [
  { id: 'av1', nome: 'Prof. Dr. Ricardo Mendonça', email: 'ricardo.mendonca@fatec.sp.gov.br', titulacao: 'Doutor', idioma: 'EN', salas: ['Lab Informática 03', 'Sala 104 - Bloco B'] },
  { id: 'av2', nome: 'Profa. Me. Elena Santos', email: 'elena.santos@fatec.sp.gov.br', titulacao: 'Mestre', idioma: 'ES', salas: ['Sala 104 - Bloco B'] },
  { id: 'av3', nome: 'Prof. Carlos Faria', email: 'carlos.faria@fatec.sp.gov.br', titulacao: 'Especialista', idioma: 'EN', salas: ['Lab Informática 01'] },
  { id: 'av4', nome: 'Profa. Dra. Helena Salles', email: 'helena.salles@fatec.sp.gov.br', titulacao: 'Doutor', idioma: 'EN', salas: ['Sala NEPLE 02'] }
];

export const mockDisponibilidades = [
  { id: 'd1', avaliador_id: 'av4', avaliador_nome: 'Profa. Dra. Helena Salles', data: '2026-10-15', hora_inicio: '10:00', hora_fim: '10:45', sala: 'Sala NEPLE 02 (Bloco Acadêmico B)', ocupado: true },
  { id: 'd2', avaliador_id: 'av4', avaliador_nome: 'Profa. Dra. Helena Salles', data: '2026-10-15', hora_inicio: '11:00', hora_fim: '11:45', sala: 'Sala NEPLE 02 (Bloco Acadêmico B)', ocupado: false },
  { id: 'd3', avaliador_id: 'av4', avaliador_nome: 'Profa. Dra. Helena Salles', data: '2026-10-17', hora_inicio: '14:00', hora_fim: '14:45', sala: 'Laboratório Multimídia 01', ocupado: false },
  { id: 'd4', avaliador_id: 'av4', avaliador_nome: 'Profa. Dra. Helena Salles', data: '2026-10-17', hora_inicio: '15:00', hora_fim: '15:45', sala: 'Laboratório Multimídia 01', ocupado: false },
  { id: 'd5', avaliador_id: 'av1', avaliador_nome: 'Prof. Dr. Ricardo Mendonça', data: '2026-10-24', hora_inicio: '09:00', hora_fim: '09:45', sala: 'Lab Informática 03', ocupado: true },
  { id: 'd6', avaliador_id: 'av2', avaliador_nome: 'Profa. Me. Elena Santos', data: '2026-10-24', hora_inicio: '10:30', hora_fim: '11:15', sala: 'Sala 104 - Bloco B', ocupado: true },
  { id: 'd7', avaliador_id: 'av3', avaliador_nome: 'Prof. Carlos Faria', data: '2026-10-25', hora_inicio: '14:00', hora_fim: '14:45', sala: 'Lab Informática 01', ocupado: true }
];

export const mockProvas = [
  {
    id: 'p1',
    aluno_id: 'a1',
    aluno_nome: 'Lucas Mendes Ferreira',
    aluno_email: 'lucas.ferreira@fatec.sp.gov.br',
    ra: '2040962313011',
    curso: 'DSM',
    semestre: '2026-2',
    avaliador_id: 'av1',
    avaliador_nome: 'Prof. Dr. Ricardo Mendonça',
    data: '2026-10-24',
    hora_inicio: '09:00',
    hora_fim: '09:45',
    sala: 'Lab Informática 03',
    status: 'concluida',
    token_confirmacao: 'f83e291a84c90e2b1',
    nota: 8.5,
    nivel_proficiencia: 'B2',
    observacoes: 'Excelente articulação léxica e pronúncia fluida.'
  },
  {
    id: 'p2',
    aluno_id: 'a2',
    aluno_nome: 'Mariana Albuquerque Souza',
    aluno_email: 'mariana.souza@fatec.sp.gov.br',
    ra: '2040962313045',
    curso: 'GTI',
    semestre: '2026-2',
    avaliador_id: 'av2',
    avaliador_nome: 'Profa. Me. Elena Santos',
    data: '2026-10-24',
    hora_inicio: '10:30',
    hora_fim: '11:15',
    sala: 'Sala 104 - Bloco B',
    status: 'confirmada',
    token_confirmacao: 'f83e291a84c90e2b2',
    nota: null,
    nivel_proficiencia: null,
    observacoes: null
  },
  {
    id: 'p3',
    aluno_id: 'a5',
    aluno_nome: 'Gabriel Santos Rocha',
    aluno_email: 'gabriel.rocha@fatec.sp.gov.br',
    ra: '2040962313078',
    curso: 'DSM',
    semestre: '2026-2',
    avaliador_id: 'av3',
    avaliador_nome: 'Prof. Carlos Faria',
    data: '2026-10-25',
    hora_inicio: '14:00',
    hora_fim: '14:45',
    sala: 'Lab Informática 01',
    status: 'agendada',
    token_confirmacao: 'f83e291a84c90e2b3',
    nota: null,
    nivel_proficiencia: null,
    observacoes: null
  },
  {
    id: 'p4',
    aluno_id: 'a6',
    aluno_nome: 'Mariana Ribeiro Guimarães',
    aluno_email: 'mariana.guimaraes@fatec.sp.gov.br',
    ra: '1430962323019',
    curso: 'GTI',
    semestre: '2026-2',
    avaliador_id: 'av4',
    avaliador_nome: 'Profa. Dra. Helena Salles',
    data: '2026-10-15',
    hora_inicio: '10:00',
    hora_fim: '10:45',
    sala: 'Sala NEPLE 02 (Bloco Acadêmico B)',
    status: 'agendada',
    token_confirmacao: 'f83e291a84c90e2b4',
    nota: null,
    nivel_proficiencia: null,
    observacoes: null
  }
];
