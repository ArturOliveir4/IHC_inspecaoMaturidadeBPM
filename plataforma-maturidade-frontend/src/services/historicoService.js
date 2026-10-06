import api from './api';

export const historicoService = {
  listarConcluidas: async () => {
    const response = await api.get('/diagnostico/historico');
    return response.data;
  },

  listarTodas: async () => {
    const response = await api.get('/diagnostico/historico/todos');
    return response.data;
  },

  detalhar: async (id) => {
    const response = await api.get(`/diagnostico/historico/${id}`);
    return response.data;
  }
};
