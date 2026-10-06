
import api from './api';

/**
 * Camada de acesso HTTP para os endpoints de avaliação (US04).
 * Todas as chamadas passam pelo cliente Axios configurado em api.js,
 * que já injeta o header Authorization: Bearer <token> automaticamente.
 *
 * Nenhum cálculo de negócio é realizado aqui — apenas comunicação HTTP.
 */
const avaliacaoService = {

  /**
   * GET /api/diagnostico/avaliacao-ativa
   *
   * Cria uma nova avaliação ou retoma a que está em andamento (CA2, CA3).
   * O e-mail do avaliador é extraído no backend a partir do token JWT.
   *
   * @returns {Promise<AvaliacaoResponseDTO>} Estado atual da avaliação
   */
  iniciarOuRetomar: async () => {
    const response = await api.get('/diagnostico/avaliacao-ativa');
    return response.data;
  },

  /**
   * PUT /api/diagnostico/avaliacao/{avaliacaoId}/resposta
   *
   * Persiste automaticamente uma resposta individual sem ação manual (CA1).
   * Realiza upsert no backend (INSERT ou UPDATE conforme a tripla principio/questao).
   *
   * @param {number} avaliacaoId  - ID da avaliação em andamento
   * @param {object} resposta     - { numeroPrincipio, numeroQuestao, nota, etapaAtual }
   * @returns {Promise<AvaliacaoResponseDTO>} Estado atualizado
   */
  salvarResposta: async (avaliacaoId, resposta) => {
    const response = await api.put(`/diagnostico/avaliacao/${avaliacaoId}/resposta`, resposta);
    return response.data;
  },

  atualizarEtapa: async (avaliacaoId, etapaAtual) => {
    const response = await api.put(`/diagnostico/avaliacao/${avaliacaoId}/etapa`, { etapaAtual });
    return response.data;
  },

  /**
   * POST /api/diagnostico/avaliacao/{avaliacaoId}/finalizar
   *
   * Envia o formulário completo e marca a avaliação como CONCLUIDA.
   * O backend valida se todas as 20 questões foram respondidas.
   *
   * @param {number} avaliacaoId
   * @returns {Promise<AvaliacaoResponseDTO>}
   */
  finalizar: async (avaliacaoId) => {
    const response = await api.post(`/diagnostico/avaliacao/${avaliacaoId}/finalizar`);
    return response.data;
  },

  /**
   * GET /api/diagnostico/avaliacao/{avaliacaoId}
   *
   * Retorna o snapshot completo para restauração do formulário (CA2).
   * Chamado no onMount quando o avaliacaoId já está em localStorage.
   *
   * @param {number} avaliacaoId
   * @returns {Promise<AvaliacaoResponseDTO>}
   */
  buscarEstado: async (avaliacaoId) => {
    const response = await api.get(`/diagnostico/avaliacao/${avaliacaoId}`);
    return response.data;
  },
};

export default avaliacaoService;
