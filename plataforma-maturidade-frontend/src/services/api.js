import axios from 'axios';

const TOKEN_KEY = '@MaturidadeBPM:token';
const USER_KEY = '@MaturidadeBPM:user';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

const encerrarSessao = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      encerrarSessao();
    }

    if (error.response?.status === 403) {
      const errorMessage = error.response.data?.message
        || 'Privilégios insuficientes para esta operação.';
      alert(`Acesso Restrito: ${errorMessage}`);
    }

    return Promise.reject(error);
  }
);

export default api;
