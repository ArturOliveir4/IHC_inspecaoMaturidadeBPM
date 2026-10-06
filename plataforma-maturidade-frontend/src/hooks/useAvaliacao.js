import { useCallback, useEffect, useState } from 'react';
import avaliacaoService from '../services/avaliacaoService';

const CHAVE_RASCUNHO = '@MaturidadeBPM:diagnostico:rascunho';
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO)) || null; } catch { return null; } };
const gravar = (dados) => localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ ...dados, atualizadoEm: Date.now() }));

const useAvaliacao = () => {
  const inicial = ler();
  const [avaliacaoId, setAvaliacaoId] = useState(inicial?.avaliacaoId || null);
  const [status, setStatus] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState(inicial?.etapaAtual || 1);
  const [respostas, setRespostas] = useState(inicial?.respostas || {});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await avaliacaoService.iniciarOuRetomar();
        const local = ler();
        const servidor = {};
        const lista = data.respostas || data.respostasQuestao || data.listaRespostas;
        if (Array.isArray(lista)) lista.forEach(r => { servidor[`P${r.numeroPrincipio}_Q${r.numeroQuestao}`] = r.nota; });
        else if (data.respostas && typeof data.respostas === 'object') Object.assign(servidor, data.respostas);
        const mesmo = local?.avaliacaoId === data.id;
        const restauradas = mesmo ? { ...servidor, ...(local.respostas || {}) } : servidor;
        const etapa = mesmo ? (local.etapaAtual || data.etapaAtual || 1) : (data.etapaAtual || 1);
        setAvaliacaoId(data.id); setStatus(data.status); setEtapaAtual(etapa); setRespostas(restauradas);
        setFinalizado(data.status === 'CONCLUIDA'); gravar({ avaliacaoId: data.id, etapaAtual: etapa, respostas: restauradas });
      } catch (e) { setErro('Sem conexão com o servidor. O rascunho local foi mantido.'); console.error(e); }
      finally { setCarregando(false); }
    })();
  }, []);

  useEffect(() => { if (avaliacaoId) gravar({ avaliacaoId, etapaAtual, respostas }); }, [avaliacaoId, etapaAtual, respostas]);

  const registrarResposta = useCallback(async (p, q, nota) => {
    if (!avaliacaoId) return;
    const novas = { ...respostas, [`P${p}_Q${q}`]: nota };
    setRespostas(novas); gravar({ avaliacaoId, etapaAtual, respostas: novas }); setErro(null);
    try { await avaliacaoService.salvarResposta(avaliacaoId, { numeroPrincipio: p, numeroQuestao: q, nota, etapaAtual }); }
    catch (e) { setErro('Sem conexão: a resposta está salva neste navegador.'); console.error(e); }
  }, [avaliacaoId, etapaAtual, respostas]);

  const alterarEtapa = useCallback(async (valor) => {
    const etapa = Math.max(1, Math.min(valor, 10));
    setEtapaAtual(etapa); gravar({ avaliacaoId, etapaAtual: etapa, respostas });
    if (!avaliacaoId) return;
    try { await avaliacaoService.atualizarEtapa(avaliacaoId, etapa); }
    catch (e) { setErro('A etapa foi salva localmente e será restaurada.'); console.error(e); }
  }, [avaliacaoId, respostas]);

  const avancarEtapa = useCallback(() => alterarEtapa(etapaAtual + 1), [alterarEtapa, etapaAtual]);
  const voltarEtapa = useCallback(() => alterarEtapa(etapaAtual - 1), [alterarEtapa, etapaAtual]);
  const reabrirQuestionario = useCallback(() => { setFinalizado(false); alterarEtapa(1); }, [alterarEtapa]);

  const finalizarAvaliacao = useCallback(async () => {
    setSalvando(true); setErro(null);
    if (Object.keys(respostas).length < 20) { setErro('Ainda existem questões sem resposta.'); setSalvando(false); return { sucesso: false, mensagem: 'Ainda existem questões sem resposta.' }; }
    try { await avaliacaoService.finalizar(avaliacaoId); setStatus('CONCLUIDA'); setFinalizado(true); localStorage.removeItem(CHAVE_RASCUNHO); return { sucesso: true }; }
    catch { setErro('Erro ao finalizar. O rascunho permanece salvo.'); return { sucesso: false, mensagem: 'Erro ao finalizar.' }; }
    finally { setSalvando(false); }
  }, [avaliacaoId, respostas]);

  const getNota = useCallback((p, q) => respostas[`P${p}_Q${q}`] ?? null, [respostas]);
  const principioCompleto = useCallback(p => respostas[`P${p}_Q1`] != null && respostas[`P${p}_Q2`] != null, [respostas]);

  return { avaliacaoId, status, etapaAtual, respostas, carregando, salvando, erro, finalizado,
    totalRespondidas: Object.keys(respostas).length, registrarResposta, avancarEtapa, voltarEtapa,
    reabrirQuestionario, finalizarAvaliacao, getNota, principioCompleto };
};
export default useAvaliacao;
