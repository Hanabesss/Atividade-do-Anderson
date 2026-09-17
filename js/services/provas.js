// js/services/provas.js
import { supabase } from '../supabase-client.js';
import { mockProvas } from '../mocks.js';

let localProvas = [...mockProvas];

export const ProvaService = {
  async listar(filtros = {}) {
    if (supabase) {
      let query = supabase.from('v_provas_detalhadas').select('*');
      if (filtros.semestre) query = query.eq('semestre', filtros.semestre);
      if (filtros.status && filtros.status !== 'todos') query = query.eq('status', filtros.status);
      if (filtros.avaliador_id) query = query.eq('avaliador_id', filtros.avaliador_id);
      const { data, error } = await query.order('data', { ascending: true });
      if (!error) return data;
    }

    let result = [...localProvas];
    if (filtros.semestre) {
      result = result.filter(p => p.semestre === filtros.semestre);
    }
    if (filtros.status && filtros.status !== 'todos') {
      result = result.filter(p => p.status === filtros.status);
    }
    if (filtros.avaliador_nome && filtros.avaliador_nome !== 'todos') {
      result = result.filter(p => p.avaliador_nome === filtros.avaliador_nome);
    }
    return result;
  },

  async buscarPorToken(token) {
    if (supabase) {
      const { data, error } = await supabase
        .from('v_provas_detalhadas')
        .select('*')
        .eq('token_confirmacao', token)
        .single();
      if (!error) return data;
    }
    return localProvas.find(p => p.token_confirmacao === token) || null;
  },

  async agendar(provaDados) {
    const token = 'conv_' + Math.random().toString(36).substring(2, 12);
    const item = {
      id: `p_${Date.now()}`,
      status: 'agendada',
      token_confirmacao: token,
      semestre: '2026-2',
      ...provaDados
    };

    if (supabase) {
      const { data, error } = await supabase.from('provas').insert(item).select().single();
      if (error) throw error;
      return data;
    }

    localProvas.unshift(item);
    return item;
  },

  async responderToken(token, aceitou, justificativa = '') {
    const status = aceitou ? 'confirmada' : 'recusada';
    if (supabase) {
      const { data, error } = await supabase
        .from('provas')
        .update({ status, justificativa_recusa: justificativa, updated_at: new Date() })
        .eq('token_confirmacao', token)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const prova = localProvas.find(p => p.token_confirmacao === token);
    if (!prova) throw new Error('Convocação não encontrada ou token inválido');
    prova.status = status;
    if (justificativa) prova.justificativa_recusa = justificativa;
    return prova;
  }
};
