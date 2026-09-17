// js/services/avaliadores.js
import { supabase } from '../supabase-client.js';
import { mockAvaliadores, mockDisponibilidades } from '../mocks.js';

let localAvaliadores = [...mockAvaliadores];
let localDisponibilidades = [...mockDisponibilidades];

export const AvaliadorService = {
  async listar() {
    if (supabase) {
      const { data, error } = await supabase.from('avaliadores').select('*').order('nome');
      if (!error) return data;
    }
    return localAvaliadores;
  },

  async criar(dados) {
    if (supabase) {
      const { data, error } = await supabase.from('avaliadores').insert(dados).select().single();
      if (error) throw error;
      return data;
    }
    const novo = { id: `av_${Date.now()}`, ...dados };
    localAvaliadores.push(novo);
    return novo;
  },

  async listarDisponibilidades(avaliadorId) {
    if (supabase) {
      let q = supabase.from('disponibilidades').select('*');
      if (avaliadorId) q = q.eq('avaliador_id', avaliadorId);
      const { data, error } = await q.order('data').order('hora_inicio');
      if (!error) return data;
    }
    if (avaliadorId) {
      return localDisponibilidades.filter(d => d.avaliador_id === avaliadorId);
    }
    return localDisponibilidades;
  },

  async salvarDisponibilidadeSlot(slotData) {
    if (supabase) {
      const { data, error } = await supabase.from('disponibilidades').insert(slotData).select().single();
      if (error) throw error;
      return data;
    }
    const novo = { id: `d_${Date.now()}`, ocupado: false, ...slotData };
    localDisponibilidades.push(novo);
    return novo;
  }
};
