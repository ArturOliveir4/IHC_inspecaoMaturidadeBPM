import api from './api';

export const comparativoService = {
  async buscarComparativo(processoId, cicloAvaliacaoId) {
    const response = await api.get(`/processos/${processoId}/comparativo`, {
      params: { cicloAvaliacaoId },
    });
    return response.data;
  },
};