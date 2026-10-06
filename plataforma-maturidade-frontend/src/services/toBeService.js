import api from './api'; // Confirme se o caminho para o seu arquivo api.js está correto

export const toBeService = {
  // Faz o POST (Cadastrar novo)
  cadastrarKpi: async (processoId, payload) => {
    const response = await api.post(`/processos/${processoId}/to-be/kpis`, payload);
    return response.data;
  },
  
  // Faz o PUT (Editar existente)
  editarKpi: async (processoId, indicadorId, payload) => {
    const response = await api.put(`/processos/${processoId}/to-be/kpis/${indicadorId}`, payload);
    return response.data;
  },
  
  // Faz o GET (Buscar)
  buscarKpis: async (processoId, cicloAvaliacaoId) => {
    const response = await api.get(`/processos/${processoId}/to-be/kpis`, {
      params: { cicloAvaliacaoId }
    });
    return response.data;
  }
};