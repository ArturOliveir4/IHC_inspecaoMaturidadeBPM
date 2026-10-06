import api from './api';

export const dashboardService = {
  async obterDashboardGerencial() {
    const response = await api.get('/dashboard/gerencial');
    return response.data;
  },
};