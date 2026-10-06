import api from './api';

export const instrumentoMonitoramentoService = {
  async listarPorProcesso(processoId) {
    return (await api.get('/instrumentos-monitoramento', { params: { processoId } })).data;
  },
  async cadastrar(dados) {
    return (await api.post('/instrumentos-monitoramento', dados)).data;
  },
};
