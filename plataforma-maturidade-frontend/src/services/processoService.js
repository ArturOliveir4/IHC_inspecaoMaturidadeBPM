import api from './api';

export const processoService = {
  async listarTodos() { return (await api.get('/processos')).data; },
  async listarPriorizados() { return (await api.get('/processos/priorizados')).data; },
  async atualizarPriorizacao(processoId, priorizado) {
    return (await api.patch(`/processos/${processoId}/priorizacao`, { priorizado })).data;
  },
};
