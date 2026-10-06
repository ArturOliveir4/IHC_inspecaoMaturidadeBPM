import api from './api';

export const planoGovernancaService = {
  listarVigentes: async () => (await api.get('/planos-governanca')).data,
  listarHistorico: async (processoId) => (await api.get(`/planos-governanca/processo/${processoId}/historico`)).data,
  salvar: async (payload) => (await api.post('/planos-governanca', payload)).data,


  // Adicione junto com o listarVigentes e listarHistorico:
  buscarChecklist: async () => {
    const response = await api.get('/planos-governanca/checklist');
    return response.data;
  },
  
  salvarChecklist: async (dados) => {
    const response = await api.put('/planos-governanca/checklist', dados);
    return response.data;
  }
};
