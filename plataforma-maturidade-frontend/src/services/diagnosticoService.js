import api from './api';

/**
 * Busca ou cria a avaliação EM_ANDAMENTO do usuário autenticado.
 * Chamado ao montar o componente do formulário.
 * @returns {Promise<object>} AvaliacaoResponseDTO com id, status e mapa de respostas
 */
export const buscarOuCriarAvaliacaoAtiva = async () => {
  const response = await api.get('/diagnostico/avaliacao-ativa');
  return response.data;
};

/**
 * Envia uma resposta individual (auto-save) ao backend.
 * Chamado a cada seleção de nota na escala Likert.
 * @param {number} avaliacaoId - ID da avaliação ativa
 * @param {number} numeroPrincipio - 1 a 10
 * @param {number} numeroQuestao - 1 ou 2
 * @param {number} nota - 1 a 5
 * @returns {Promise<object>} AvaliacaoResponseDTO atualizado
 */
export const salvarResposta = async (avaliacaoId, numeroPrincipio, numeroQuestao, nota) => {
  const response = await api.put(`/diagnostico/avaliacao/${avaliacaoId}/resposta`, {
    numeroPrincipio,
    numeroQuestao,
    nota,
  });
  return response.data;
};

/**
 * Finaliza a avaliação após o usuário confirmar o envio de todas as questões.
 * O backend valida se todas as 20 respostas estão presentes antes de concluir.
 * @param {number} avaliacaoId - ID da avaliação ativa
 * @returns {Promise<object>} AvaliacaoResponseDTO com status CONCLUIDA
 */
export const finalizarAvaliacao = async (avaliacaoId) => {
  const response = await api.post(`/diagnostico/avaliacao/${avaliacaoId}/finalizar`);
  return response.data;
};
