// js/services/notas.js
import { supabase } from '../supabase-client.js';
import { mockProvas } from '../mocks.js';

export const NotaService = {
  async registrar(provaId, nota, nivel, observacoes) {
    if (supabase) {
      const { data, error } = await supabase.from('notas').upsert({
        prova_id: provaId,
        nota: parseFloat(nota),
        nivel_proficiencia: nivel,
        observacoes
      }).select().single();

      if (!error) {
        await supabase.from('provas').update({ status: 'concluida' }).eq('id', provaId);
        return data;
      }
    }

    const prova = mockProvas.find(p => p.id === provaId);
    if (prova) {
      prova.nota = parseFloat(nota);
      prova.nivel_proficiencia = nivel;
      prova.observacoes = observacoes;
      prova.status = 'concluida';
      return prova;
    }
    throw new Error('Prova não encontrada para registro de nota');
  }
};
