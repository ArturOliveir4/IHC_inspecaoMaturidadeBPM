import api from './api';

export const acionamentoGatilhoService = {
  async acionar(processoId, payload) {
    const response = await api.post(`/processos/${processoId}/gatilhos/acionar`, payload);
    return response.data;
  }
};