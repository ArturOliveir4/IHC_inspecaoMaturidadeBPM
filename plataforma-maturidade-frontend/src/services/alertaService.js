import api from './api';

export const alertaService = {
  async listarPorProcesso(processoId) {
    const response = await api.get(`/processos/${processoId}/alertas`);
    return response.data;
  },

  async criar(processoId, payload) {
    const response = await api.post(`/processos/${processoId}/alertas`, payload);
    return response.data;
  },

  async atualizar(processoId, alertaId, payload) {
    const response = await api.put(`/processos/${processoId}/alertas/${alertaId}`, payload);
    return response.data;
  },

  async excluir(processoId, alertaId) {
    await api.delete(`/processos/${processoId}/alertas/${alertaId}`);
  },

  // NOVA FUNÇÃO (US20 - Concluir Revisão)
  async concluirRevisao(processoId, alertaId) {
    const response = await api.patch(`/processos/${processoId}/alertas/${alertaId}/concluir`);
    return response.data;
  },

  // Consolidado de todos os processos — preparação para o calendário (US17)
  async listarTodosAtivos() {
    const response = await api.get('/alertas');
    return response.data;
  },
};