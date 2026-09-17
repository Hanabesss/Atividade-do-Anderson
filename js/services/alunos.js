// js/services/alunos.js
import { supabase } from '../supabase-client.js';
import { mockAlunos } from '../mocks.js';

let localAlunos = [...mockAlunos];

export const AlunoService = {
  async listar() {
    if (supabase) {
      const { data, error } = await supabase.from('alunos').select('*').order('nome');
      if (!error) return data;
    }
    return localAlunos;
  },

  async buscarPorRaOuNome(termo) {
    const lista = await this.listar();
    if (!termo) return lista;
    const lower = termo.toLowerCase();
    return lista.filter(a => a.nome.toLowerCase().includes(lower) || a.ra.includes(lower));
  },

  async importarCSV(alunosArray) {
    if (supabase) {
      const { data, error } = await supabase.from('alunos').upsert(alunosArray, { onConflict: 'ra' }).select();
      if (!error) return { inseridos: data.length, erros: [] };
    }

    // Processamento mock local
    let inseridos = 0;
    const erros = [];
    alunosArray.forEach((aluno, index) => {
      if (!aluno.ra || !aluno.nome || !aluno.email) {
        erros.push({ linha: index + 1, ra: aluno.ra, motivo: 'Campos obrigatórios ausentes' });
        return;
      }
      if (!aluno.email.endsWith('@fatec.sp.gov.br')) {
        erros.push({ linha: index + 1, ra: aluno.ra, motivo: 'E-mail institucional inválido' });
        return;
      }

      const idx = localAlunos.findIndex(a => a.ra === aluno.ra);
      const item = { id: `a_${Date.now()}_${index}`, status_agendamento: 'sem_agendamento', ...aluno };
      if (idx >= 0) {
        localAlunos[idx] = { ...localAlunos[idx], ...aluno };
      } else {
        localAlunos.push(item);
      }
      inseridos++;
    });

    return { inseridos, erros };
  }
};
