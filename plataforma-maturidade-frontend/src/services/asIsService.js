import api from './api';

export const asIsService = {
  async buscarKpis(processoId, cicloAvaliacaoId) {
    const response = await api.get(`/processos/${processoId}/as-is/kpis`, {
      params: { cicloAvaliacaoId },
    });
    return response.data;
  },

  async cadastrarKpi(processoId, payload) {
    const response = await api.post(`/processos/${processoId}/as-is/kpis`, payload);
    return response.data;
  },

  async editarKpi(processoId, indicadorId, payload) {
    const response = await api.put(`/processos/${processoId}/as-is/kpis/${indicadorId}`, payload);
    return response.data;
  },

  async buscarDiagrama(processoId) {
    const response = await api.get(`/processos/${processoId}/as-is/diagrama`);
    return response.data;
  },

  async enviarDiagrama(processoId, arquivo) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const response = await api.post(`/processos/${processoId}/as-is/diagrama`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  urlArquivoDiagrama(processoId) {
    return `${api.defaults.baseURL}/processos/${processoId}/as-is/diagrama/arquivo`;
  },
};
