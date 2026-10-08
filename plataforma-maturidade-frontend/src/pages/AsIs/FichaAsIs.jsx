import React, { useState, useEffect, useMemo, useRef } from 'react';
import { asIsService } from '../../services/asIsService';
import api from '../../services/api'; 

const CHAVE_RASCUNHO_ASIS = '@MaturidadeBPM:kpi-as-is:rascunho';

export const FichaAsIs = ({ cicloAvaliacaoId = 1 }) => {
  const [visao, setVisao] = useState('LISTA');
  
  const [processos, setProcessos] = useState([]);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [diagramaAtual, setDiagramaAtual] = useState(null); 

  const [novoProcesso, setNovoProcesso] = useState({ nome: '', descricao: '' });
  const [arquivo, setArquivo] = useState(null);

  // <-- NOVO: Estado de controle para a Validação Humana do Risco
  const [uploadValidado, setUploadValidado] = useState(false);

  const [setorResponsavel, setSetorResponsavel] = useState('CRPA / PROGRAD');
  const [dataMedicao, setDataMedicao] = useState(new Date().toISOString().split('T')[0]);
  const [responsavelAnalise, setResponsavelAnalise] = useState('');
  const [motivoPriorizacao, setMotivoPriorizacao] = useState('Falta de Padronização');
  const [unidadeTmc, setUnidadeTmc] = useState('DIAS');
  const [dataInicioAmostra, setDataInicioAmostra] = useState('');
  const [dataFimAmostra, setDataFimAmostra] = useState('');
  const [notaAgilidade, setNotaAgilidade] = useState(3);
  const [notaClareza, setNotaClareza] = useState(3);
  const [casos, setCasos] = useState([{ identificadorCaso: '01', dataInicio: new Date().toISOString().split('T')[0], dataFim: new Date().toISOString().split('T')[0], tempoTotal: 1, houveRetrabalho: false, observacao: '' }]);

  const [indicadorId, setIndicadorId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [erros, setErros] = useState({});
  const [camposAlterados, setCamposAlterados] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [rascunhoRestaurado, setRascunhoRestaurado] = useState(false);
  const restauracaoAutomaticaRealizada = useRef(false);

  useEffect(() => { carregarProcessos(); }, []);

  useEffect(() => {
    if (visao !== 'FICHA' || !processoSelecionado) return;
    const deveManterRascunho = Object.keys(camposAlterados).length > 0 || rascunhoRestaurado;
    if (!deveManterRascunho) return;
    localStorage.setItem(CHAVE_RASCUNHO_ASIS, JSON.stringify({ processoId: processoSelecionado.id, cicloAvaliacaoId, setorResponsavel, dataMedicao, responsavelAnalise, motivoPriorizacao, unidadeTmc, dataInicioAmostra, dataFimAmostra, notaAgilidade, notaClareza, casos, indicadorId, atualizadoEm: Date.now() }));
  }, [visao, processoSelecionado, cicloAvaliacaoId, setorResponsavel, dataMedicao, responsavelAnalise, motivoPriorizacao, unidadeTmc, dataInicioAmostra, dataFimAmostra, notaAgilidade, notaClareza, casos, indicadorId, camposAlterados, rascunhoRestaurado]);

  const carregarProcessos = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/processos');
      const lista = Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.content) ? res.data.content : []);
      setProcessos(lista);
      if (!restauracaoAutomaticaRealizada.current) {
        restauracaoAutomaticaRealizada.current = true;
        try {
          const rascunho = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO_ASIS));
          const processo = lista.find(item => item.id === rascunho?.processoId);
          if (processo) selecionarProcesso(processo, true);
        } catch {}
      }
    } catch (err) {
      setFeedback({ tipo: 'danger', texto: 'Erro ao carregar a lista de processos.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletarProcesso = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Atenção! Tem certeza que deseja excluir este processo? Todos os dados vinculados serão perdidos.")) {
      return;
    }
    try {
      setCarregando(true);
      await api.delete(`/processos/${id}`);
      setFeedback({ tipo: 'success', texto: 'Processo removido com sucesso!' });
      await carregarProcessos();
    } catch (err) {
      setFeedback({ tipo: 'danger', texto: 'Erro ao excluir processo. Pode haver dependências vinculadas.' });
    } finally {
      setCarregando(false);
    }
  };

  const selecionarProcesso = async (processo, restaurarRascunho = false) => {
    setProcessoSelecionado(processo);
    setVisao('FICHA');
    setFeedback(null);
    setErros({});
    setCamposAlterados({});
    setRascunhoRestaurado(false);
    setIndicadorId(null);
    setDiagramaAtual(null);
    setUploadValidado(false); 

    setSetorResponsavel('CRPA / PROGRAD');
    setDataMedicao(new Date().toISOString().split('T')[0]);
    setResponsavelAnalise('');
    setMotivoPriorizacao('Falta de Padronização');
    setUnidadeTmc('DIAS');
    setDataInicioAmostra('');
    setDataFimAmostra('');
    setNotaAgilidade(3);
    setNotaClareza(3);
    setCasos([{ identificadorCaso: '01', dataInicio: new Date().toISOString().split('T')[0], dataFim: new Date().toISOString().split('T')[0], tempoTotal: 1, houveRetrabalho: false, observacao: '' }]);

    try {
      setCarregando(true);
      const data = await asIsService.buscarKpis(processo.id, cicloAvaliacaoId);
      if (data) {
        setIndicadorId(data.id);
        setSetorResponsavel(data.setorResponsavel || 'CRPA / PROGRAD');
        setDataMedicao(data.dataMedicao || new Date().toISOString().split('T')[0]);
        setResponsavelAnalise(data.responsavelAnalise || '');
        setMotivoPriorizacao(data.motivoPriorizacao || 'Falta de Padronização');
        setUnidadeTmc(data.unidadeTmc || 'DIAS');
        setDataInicioAmostra(data.dataInicioAmostra || '');
        setDataFimAmostra(data.dataFimAmostra || '');
        setNotaAgilidade(data.notaAgilidade || 3);
        setNotaClareza(data.notaClareza || 3);
        if (data.casos && data.casos.length > 0) setCasos(data.casos);
      }
    } catch (err) {}

    try {
      const resDiagrama = await api.get(`/processos/${processo.id}/as-is/diagrama`);
      setDiagramaAtual(resDiagrama.data);
      
      // 👇 MUDANÇA AQUI: Usando processo.id (garantido)
      const jaValidou = localStorage.getItem(`diagrama_validado_processo_${processo.id}`);
      setUploadValidado(jaValidou === 'true');
      
    } catch(err) {
      setDiagramaAtual(null);
      setUploadValidado(false);
    } finally {
      if (restaurarRascunho) {
        try {
          const r = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO_ASIS));
          if (r?.processoId === processo.id) {
            setIndicadorId(r.indicadorId ?? null); setSetorResponsavel(r.setorResponsavel ?? 'CRPA / PROGRAD');
            setDataMedicao(r.dataMedicao ?? new Date().toISOString().split('T')[0]); setResponsavelAnalise(r.responsavelAnalise ?? '');
            setMotivoPriorizacao(r.motivoPriorizacao ?? 'Falta de Padronização'); setUnidadeTmc(r.unidadeTmc ?? 'DIAS');
            setDataInicioAmostra(r.dataInicioAmostra ?? ''); setDataFimAmostra(r.dataFimAmostra ?? '');
            setNotaAgilidade(r.notaAgilidade ?? 3); setNotaClareza(r.notaClareza ?? 3);
            if (Array.isArray(r.casos) && r.casos.length) setCasos(r.casos);
            setRascunhoRestaurado(true);
            setFeedback({ tipo: 'info', texto: 'Rascunho restaurado automaticamente.' });
          }
        } catch {}
      }
      setCarregando(false);
    }
  };

  const handleVisualizarArquivo = async () => {
    if (!processoSelecionado) return;
    try {
      setFeedback({ tipo: 'info', texto: 'Abrindo arquivo...' });
      const res = await api.get(`/processos/${processoSelecionado.id}/as-is/diagrama/arquivo`, {
        responseType: 'blob'
      });
      const fileURL = URL.createObjectURL(res.data);
      window.open(fileURL, '_blank');
      
      setUploadValidado(true); 
      
      // 👇 MUDANÇA AQUI: Salvando usando processoSelecionado.id
      localStorage.setItem(`diagrama_validado_processo_${processoSelecionado.id}`, 'true');

      setFeedback(null);
    } catch (error) {
      setFeedback({ tipo: 'danger', texto: 'Não foi possível carregar o arquivo do diagrama.' });
    }
  };

  const handleFileChange = (e) => {
    setFeedback(null);
    const file = e.target.files[0];
    if (!file) return;

    const formatosAceitos = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!formatosAceitos.includes(file.type)) {
      setFeedback({ tipo: 'danger', texto: 'Formato inválido. O sistema aceita apenas arquivos PDF, PNG ou JPEG.' });
      setArquivo(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ tipo: 'danger', texto: 'O arquivo excede o limite máximo permitido de 10 MB.' });
      setArquivo(null);
      return;
    }

    setArquivo(file);
  };

  const handleCadastrarProcesso = async (e) => {
    e.preventDefault();
    if (!novoProcesso.nome.trim()) return;

    try {
      setCarregando(true);
      setFeedback(null);
      
      const res = await api.post('/processos', novoProcesso);
      const processoCriado = res.data;

      if (arquivo) {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        await api.post(`/processos/${processoCriado.id}/as-is/diagrama`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setNovoProcesso({ nome: '', descricao: '' });
      setArquivo(null);
      
      await carregarProcessos();
      selecionarProcesso(processoCriado);
      
      // <-- NOVO: Alerta explicativo para mitigar o risco mapeado no FMEA
      if (arquivo) {
        setFeedback({ 
          tipo: 'warning', 
          texto: 'Processo e diagrama salvos! AÇÃO REQUERIDA: Clique no botão "Visualizar Arquivo Anexado" no topo da página para realizar a validação humana e garantir que o upload não foi corrompido.' 
        });
      } else {
        setFeedback({ tipo: 'success', texto: 'Processo cadastrado com sucesso!' });
      }

    } catch (err) {
      setFeedback({ tipo: 'danger', texto: 'Erro ao cadastrar novo processo ou diagrama.' });
    } finally {
      setCarregando(false);
    }
  };

  const kpisCalculados = useMemo(() => {
    const N = casos.length;
    if (N === 0) return { tmc: 0, tr: 0, ns: 0, N: 0 };
    const somaTempo = casos.reduce((acc, c) => acc + (Number(c.tempoTotal) || 0), 0);
    const tmc = (somaTempo / N).toFixed(2);
    const qtdRetrabalho = casos.filter((c) => Boolean(c.houveRetrabalho)).length;
    const tr = ((qtdRetrabalho / N) * 100).toFixed(2);
    const ns = ((Number(notaAgilidade) + Number(notaClareza)) / 2).toFixed(1);
    return { tmc, tr, ns, N };
  }, [casos, notaAgilidade, notaClareza]);

  const adicionarCaso = () => {
    const proximoId = String(casos.length + 1).padStart(2, '0');
    setCasos([...casos, { identificadorCaso: proximoId, dataInicio: new Date().toISOString().split('T')[0], dataFim: new Date().toISOString().split('T')[0], tempoTotal: 1, houveRetrabalho: false, observacao: '' }]);
    marcarAlterado('estruturaCasos');
  };

  const removerCaso = (index) => {
    if (casos.length === 1) {
      setFeedback({ tipo: 'danger', texto: 'A amostra deve ter ao menos 1 caso (N ≥ 1).' });
      return;
    }
    setCasos(casos.filter((_, i) => i !== index));
    marcarAlterado('estruturaCasos');
  };

  const marcarAlterado = (campo) => setCamposAlterados((prev) => ({ ...prev, [campo]: true }));

  const possuiAlteracoes = Object.keys(camposAlterados).length > 0 || rascunhoRestaurado;

  const irParaSecao = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const descartarAlteracoesFicha = async () => {
    if (!processoSelecionado) return;
    if (possuiAlteracoes && !window.confirm('Descartar as alterações atuais e restaurar os dados salvos da Ficha AS-IS?')) return;
    localStorage.removeItem(CHAVE_RASCUNHO_ASIS);
    setCamposAlterados({});
    setRascunhoRestaurado(false);
    await selecionarProcesso(processoSelecionado, false);
    setFeedback({ tipo: 'info', texto: indicadorId ? 'Alterações descartadas. A ficha salva foi restaurada.' : 'Alterações descartadas. O formulário foi reiniciado.' });
  };

  const atualizarCaso = (index, campo, valor) => {
    const novaLista = [...casos];
    novaLista[index] = { ...novaLista[index], [campo]: valor };
    setCasos(novaLista);
    marcarAlterado(`caso-${index}-${campo}`);
    if (erros[`caso-${index}-${campo}`]) {
      setErros((prev) => ({ ...prev, [`caso-${index}-${campo}`]: '' }));
    }
  };

  const validarCasoCampo = (index, campo) => {
    const caso = casos[index];
    if (!caso) return;
    let mensagem = '';
    if (campo === 'identificadorCaso' && !String(caso.identificadorCaso || '').trim()) mensagem = 'Informe o ID do caso.';
    if (campo === 'dataInicio') {
      if (!caso.dataInicio) mensagem = 'Informe a Data Início.';
      else if (dataInicioAmostra && dataFimAmostra && (caso.dataInicio < dataInicioAmostra || (caso.dataFim && caso.dataFim > dataFimAmostra))) mensagem = 'As datas do caso devem permanecer dentro do período da amostra.';
    }
    if (campo === 'dataFim') {
      if (!caso.dataFim) mensagem = 'Informe a Data Fim.';
      else if (caso.dataInicio && caso.dataFim < caso.dataInicio) mensagem = 'A Data Fim não pode ser anterior à Data Início.';
      else if (dataInicioAmostra && dataFimAmostra && (caso.dataInicio < dataInicioAmostra || caso.dataFim > dataFimAmostra)) mensagem = 'As datas do caso devem permanecer dentro do período da amostra.';
    }
    if (campo === 'tempoTotal' && (caso.tempoTotal === '' || caso.tempoTotal === null || Number(caso.tempoTotal) < 0)) mensagem = 'Informe um tempo maior ou igual a zero.';
    setErros((prev) => ({ ...prev, [`caso-${index}-${campo}`]: mensagem }));
  };

  const validarPeriodoAmostra = () => {
    const novos = {};
    if ((dataInicioAmostra && !dataFimAmostra) || (!dataInicioAmostra && dataFimAmostra)) {
      if (!dataInicioAmostra) novos.dataInicioAmostra = 'Informe o início do período ou deixe as duas datas em branco.';
      if (!dataFimAmostra) novos.dataFimAmostra = 'Informe o fim do período ou deixe as duas datas em branco.';
    }
    if (dataInicioAmostra && dataFimAmostra && dataFimAmostra < dataInicioAmostra) {
      novos.dataFimAmostra = 'A Data Fim da amostra não pode ser anterior à Data Início.';
    }
    setErros((prev) => ({ ...prev, dataInicioAmostra: novos.dataInicioAmostra || '', dataFimAmostra: novos.dataFimAmostra || '' }));
  };

  const validarFicha = () => {
    const novosErros = {};
    if (!setorResponsavel.trim()) novosErros.setorResponsavel = 'Informe o setor responsável.';
    if (!dataMedicao) novosErros.dataMedicao = 'Informe a data da medição.';
    if (!responsavelAnalise.trim()) novosErros.responsavelAnalise = 'Informe o responsável pela análise.';

    if ((dataInicioAmostra && !dataFimAmostra) || (!dataInicioAmostra && dataFimAmostra)) {
      if (!dataInicioAmostra) novosErros.dataInicioAmostra = 'Informe o início do período ou deixe as duas datas da amostra em branco.';
      if (!dataFimAmostra) novosErros.dataFimAmostra = 'Informe o fim do período ou deixe as duas datas da amostra em branco.';
    }
    if (dataInicioAmostra && dataFimAmostra && dataFimAmostra < dataInicioAmostra) {
      novosErros.dataFimAmostra = 'A Data Fim da amostra não pode ser anterior à Data Início.';
    }

    casos.forEach((caso, index) => {
      if (!String(caso.identificadorCaso || '').trim()) novosErros[`caso-${index}-identificadorCaso`] = 'Informe o ID do caso.';
      if (!caso.dataInicio) novosErros[`caso-${index}-dataInicio`] = 'Informe a Data Início.';
      if (!caso.dataFim) novosErros[`caso-${index}-dataFim`] = 'Informe a Data Fim.';
      if (caso.dataInicio && caso.dataFim && caso.dataFim < caso.dataInicio) {
        novosErros[`caso-${index}-dataFim`] = 'A Data Fim não pode ser anterior à Data Início.';
      }
      if (caso.tempoTotal === '' || caso.tempoTotal === null || Number(caso.tempoTotal) < 0) {
        novosErros[`caso-${index}-tempoTotal`] = 'Informe um tempo maior ou igual a zero.';
      }
      if (dataInicioAmostra && dataFimAmostra && caso.dataInicio && caso.dataFim) {
        if (caso.dataInicio < dataInicioAmostra || caso.dataFim > dataFimAmostra) {
          novosErros[`caso-${index}-dataInicio`] = 'As datas do caso devem permanecer dentro do período da amostra.';
        }
      }
    });
    return novosErros;
  };

  const handleSubmitFicha = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const novosErros = validarFicha();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      setFeedback({ tipo: 'danger', texto: 'Revise os campos destacados antes de salvar a Ficha AS-IS.' });
      const primeiroCampo = document.querySelector('.input-error');
      primeiroCampo?.focus();
      return;
    }
    const payload = { cicloAvaliacaoId, setorResponsavel, dataMedicao, responsavelAnalise, motivoPriorizacao, dataInicioAmostra, dataFimAmostra, unidadeTmc, notaAgilidade: Number(notaAgilidade), notaClareza: Number(notaClareza), casos };
    try {
      setCarregando(true);
      if (indicadorId) {
        await asIsService.editarKpi(processoSelecionado.id, indicadorId, payload);
        setFeedback({ tipo: 'success', texto: 'Ficha AS-IS atualizada com sucesso!' });
      } else {
        const res = await asIsService.cadastrarKpi(processoSelecionado.id, payload);
        setIndicadorId(res.id);
        setFeedback({ tipo: 'success', texto: 'Ficha AS-IS cadastrada com sucesso!' });
      }
      localStorage.removeItem(CHAVE_RASCUNHO_ASIS);
      setCamposAlterados({});
      setRascunhoRestaurado(false);
    } catch (err) {
      const mensagemErro = err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar Ficha AS-IS.';
      const normalizada = mensagemErro.toLowerCase();
      const novos = {};
      if (normalizada.includes('responsável pela análise')) novos.responsavelAnalise = mensagemErro;
      if (normalizada.includes('data fim') && normalizada.includes('amostra')) novos.dataFimAmostra = mensagemErro;
      const casoEncontrado = casos.findIndex((caso) => normalizada.includes(`caso ${String(caso.identificadorCaso).toLowerCase()}`));
      if (casoEncontrado >= 0) {
        if (normalizada.includes('data fim') || normalizada.includes('datas')) novos[`caso-${casoEncontrado}-dataFim`] = mensagemErro;
        else if (normalizada.includes('tempo')) novos[`caso-${casoEncontrado}-tempoTotal`] = mensagemErro;
      }
      if (Object.keys(novos).length) setErros((prev) => ({ ...prev, ...novos }));
      setFeedback({ tipo: 'danger', texto: mensagemErro });
    } finally {
      setCarregando(false);
    }
  };

  if (visao === 'LISTA') {
    return (
      <div className="page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <header className="page-header" style={{ marginBottom: '24px' }}>
          <span className="badge badge-primary">Módulo 2</span>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Gestão da Ficha AS-IS</h1>
          <p className="page-description">Selecione um processo cadastrado para gerenciar sua Ficha AS-IS ou cadastre um novo processo.</p>
        </header>

        {feedback && <div className={`alert alert-${feedback.tipo}`}>{feedback.texto}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
          <article className="card card-pad" style={{ padding: '20px' }}>
            <h2 className="card-title">1. Processos Cadastrados</h2>
            <p className="card-description">Clique em um processo para acessar a Ficha AS-IS.</p>
            {carregando ? (
              <p style={{ marginTop: '16px' }}>Carregando processos...</p>
            ) : processos.length === 0 ? (
              <p style={{ marginTop: '16px', color: '#64748b' }}>Nenhum processo cadastrado ainda.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
                {processos.map((proc) => (
                  <li key={proc.id} onClick={() => selecionarProcesso(proc)} style={{ padding: '12px 16px', marginBottom: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{proc.nome}</strong>
                      {proc.descricao && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{proc.descricao}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={(e) => handleDeletarProcesso(proc.id, e)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                        Excluir
                      </button>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Abrir Ficha →</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card card-pad" style={{ padding: '20px' }}>
            <h2 className="card-title">2. Cadastrar Novo Processo</h2>
            <p className="card-description">Adicione um novo processo para iniciar a linha de base.</p>
            <div className="form-guidance">
              Informe o nome do processo e, se disponível, uma descrição e o diagrama BPMN.
              <strong> Campos marcados com * são obrigatórios.</strong> Após o cadastro, a Ficha AS-IS será aberta automaticamente.
            </div>

            <form onSubmit={handleCadastrarProcesso} style={{ marginTop: '16px' }}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="label">Nome do Processo<span className="required-mark" aria-hidden="true">*</span></label>
                <input className="input" autoFocus placeholder="Ex: Solicitação de Histórico" value={novoProcesso.nome} onChange={(e) => setNovoProcesso({ ...novoProcesso, nome: e.target.value })} required aria-required="true" />
              </div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label className="label">Descrição (Opcional)</label>
                <textarea className="input" placeholder="Descrição sucinta do fluxo..." value={novoProcesso.descricao} onChange={(e) => setNovoProcesso({ ...novoProcesso, descricao: e.target.value })} rows={3} />
              </div>
              <div className="field" style={{ marginBottom: '16px' }}>
                <label className="label">Diagrama BPMN (PDF, PNG, JPEG - Máx 10MB)</label>
                <div style={{ border: '2px dashed #cbd5e1', padding: '20px', textAlign: 'center', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                  <input type="file" accept=".pdf,.png,.jpeg,.jpg" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} />
                  {!arquivo && <p style={{ marginTop: '10px', color: '#64748b', fontSize: '0.9rem' }}>Arraste e solte o arquivo ou clique para selecionar.</p>}
                  {arquivo && <p style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold' }}>Anexo: {arquivo.name}</p>}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={carregando}>
                {carregando ? 'Processando...' : '+ Cadastrar e Abrir Ficha'}
              </button>
            </form>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button type="button" className="btn btn-secondary" onClick={() => setVisao('LISTA')} style={{ marginBottom: '16px' }}>
        ← Voltar para Lista de Processos
      </button>

      <header className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge badge-primary">Processo Selecionado</span>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Ficha AS-IS — {processoSelecionado?.nome}</h1>
          <p className="page-description">{processoSelecionado?.descricao || 'Análise de Linha de Base (AS-IS)'}</p>
        </div>
        
        {/* <-- NOVO: Seção do Botão com o Selo de Validação Humana */}
        {diagramaAtual && (
          <div style={{ textAlign: 'right' }}>
            <button type="button" className="btn btn-primary" onClick={handleVisualizarArquivo} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
              📄 Visualizar Arquivo Anexado
            </button>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Enviado em {new Date(diagramaAtual.enviadoEm).toLocaleDateString()}
            </p>
            
            {!uploadValidado ? (
              <div style={{ marginTop: '8px', color: '#b45309', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <span>⚠️ Validação humana pendente (Clique para confirmar integridade)</span>
              </div>
            ) : (
              <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                <span>✅ Upload validado pelo usuário</span>
              </div>
            )}
          </div>
        )}
      </header>

      {feedback && <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: '20px' }}>{feedback.texto}</div>}

      <section className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="stat-label">KPI 1.1 - Tempo Médio de Ciclo (TMC)</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{kpisCalculados.tmc} {unidadeTmc.toLowerCase()}</div>
          <span className="stat-sub">Média dos Tempos Totais (N={kpisCalculados.N})</span>
        </div>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="stat-label">KPI 2.1 - Taxa de Retrabalho (TR)</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>{kpisCalculados.tr}%</div>
          <span className="stat-sub">Casos com Retrabalho</span>
        </div>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="stat-label">KPI 3.1 - Nível de Satisfação (NS)</div>
          <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{kpisCalculados.ns} / 5.0</div>
          <span className="stat-sub">Média da Enquete</span>
        </div>
      </section>

      <div className="form-guidance">
        Preencha as informações da linha de base, registre ao menos um caso real e revise a avaliação de satisfação.
        <strong> Campos marcados com * são obrigatórios.</strong> Use “Salvar Ficha AS-IS” para gravar as alterações; o sistema mantém um rascunho local durante o preenchimento.
      </div>
      {indicadorId && (
        <div className="loaded-values-note">
          <strong>Valores carregados:</strong> campos com fundo azul vieram da Ficha AS-IS salva. O destaque é removido à medida que os valores são editados.
        </div>
      )}

      <nav className="section-jump-nav" aria-label="Atalhos para seções da Ficha AS-IS">
        <span className="section-jump-label">Ir para:</span>
        <button type="button" className="section-jump-link" onClick={() => irParaSecao('asis-contexto')}>Contexto e Identificação</button>
        <button type="button" className="section-jump-link" onClick={() => irParaSecao('asis-amostras')}>Amostras de Casos Reais</button>
        <button type="button" className="section-jump-link" onClick={() => irParaSecao('asis-satisfacao')}>Avaliação de Satisfação</button>
      </nav>

      <form onSubmit={handleSubmitFicha}>
        <article id="asis-contexto" className="card card-pad section-anchor-target" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 className="card-title">1. Contexto e Identificação</h2>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="field">
              <label className="label">Nome do Processo</label>
              <textarea className="textarea long-text-control" value={processoSelecionado?.nome || ''} disabled rows={2} aria-label="Nome do processo" />
            </div>
            <div className="field">
              <label className="label">Setor Responsável<span className="required-mark" aria-hidden="true">*</span></label>
              <input className={`input ${indicadorId && !camposAlterados.setorResponsavel ? 'field-loaded-control' : ''} ${erros.setorResponsavel ? 'input-error' : ''}`} autoFocus aria-required="true" aria-invalid={Boolean(erros.setorResponsavel)} value={setorResponsavel} onChange={(e) => { setSetorResponsavel(e.target.value); marcarAlterado('setorResponsavel'); if (erros.setorResponsavel) setErros((prev) => ({ ...prev, setorResponsavel: '' })); }} onBlur={() => { if (!setorResponsavel.trim()) setErros((prev) => ({ ...prev, setorResponsavel: 'Informe o setor responsável.' })); }} required />
              {!indicadorId && !camposAlterados.setorResponsavel && <span className="field-state-hint">Valor padrão: CRPA / PROGRAD</span>}
              {indicadorId && !camposAlterados.setorResponsavel && <span className="field-state-hint">Valor carregado da ficha salva</span>}
              {erros.setorResponsavel && <span className="field-error">{erros.setorResponsavel}</span>}
            </div>
            <div className="field">
              <label className="label">Data da Medição<span className="required-mark" aria-hidden="true">*</span></label>
              <input type="date" className={`input ${indicadorId && !camposAlterados.dataMedicao ? 'field-loaded-control' : ''} ${erros.dataMedicao ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.dataMedicao)} value={dataMedicao} onChange={(e) => { setDataMedicao(e.target.value); marcarAlterado('dataMedicao'); if (erros.dataMedicao) setErros((prev) => ({ ...prev, dataMedicao: '' })); }} onBlur={() => { if (!dataMedicao) setErros((prev) => ({ ...prev, dataMedicao: 'Informe a data da medição.' })); }} required />
              {indicadorId && !camposAlterados.dataMedicao && <span className="field-state-hint">Valor carregado da ficha salva</span>}
              {erros.dataMedicao && <span className="field-error">{erros.dataMedicao}</span>}
            </div>
            <div className="field">
              <label className="label">Responsável pela Análise<span className="required-mark" aria-hidden="true">*</span></label>
              <input className={`input ${indicadorId && !camposAlterados.responsavelAnalise ? 'field-loaded-control' : ''} ${erros.responsavelAnalise ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.responsavelAnalise)} placeholder="Nome do analista" value={responsavelAnalise} onChange={(e) => { setResponsavelAnalise(e.target.value); marcarAlterado('responsavelAnalise'); if (erros.responsavelAnalise) setErros((prev) => ({ ...prev, responsavelAnalise: '' })); }} onBlur={() => { if (!responsavelAnalise.trim()) setErros((prev) => ({ ...prev, responsavelAnalise: 'Informe o responsável pela análise.' })); }} required />
              {indicadorId && !camposAlterados.responsavelAnalise && <span className="field-state-hint">Valor carregado da ficha salva</span>}
              {erros.responsavelAnalise && <span className="field-error">{erros.responsavelAnalise}</span>}
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label className="label">Motivo da Priorização</label>
              <select className={`select ${indicadorId && !camposAlterados.motivoPriorizacao ? 'field-loaded-control' : ''}`} value={motivoPriorizacao} onChange={(e) => { setMotivoPriorizacao(e.target.value); marcarAlterado('motivoPriorizacao'); }}>
                <option value="Falta de Padronização">Falta de Padronização</option>
                <option value="Baixa Tecnologia">Baixa Tecnologia</option>
                <option value="Alta Complexidade">Alta Complexidade</option>
              </select>
              {!indicadorId && !camposAlterados.motivoPriorizacao && <span className="field-state-hint">Valor padrão: Falta de Padronização</span>}
              {indicadorId && !camposAlterados.motivoPriorizacao && <span className="field-state-hint">Valor carregado da ficha salva</span>}
            </div>
          </div>
        </article>

        <article id="asis-amostras" className="card card-pad section-anchor-target" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">2. Amostras de Casos Reais (N = {kpisCalculados.N})</h2>
              <p className="card-description">Cadastre os casos observados para cálculo automático das métricas.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={adicionarCaso}>+ Adicionar Caso</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '16px', marginBottom: '16px', maxWidth: '420px' }}>
            <div className="field">
              <label className="label">Unidade de Tempo</label>
              <select className={`select ${indicadorId && !camposAlterados.unidadeTmc ? 'field-loaded-control' : ''}`} value={unidadeTmc} onChange={(e) => { setUnidadeTmc(e.target.value); marcarAlterado('unidadeTmc'); }}>
                <option value="DIAS">Dias Úteis</option>
                <option value="HORAS">Horas</option>
              </select>
              <span className="field-help">Defina a unidade antes de informar o tempo dos casos.</span>
              {!indicadorId && !camposAlterados.unidadeTmc && <span className="field-state-hint">Valor padrão: Dias Úteis</span>}
              {indicadorId && !camposAlterados.unidadeTmc && <span className="field-state-hint">Valor carregado da ficha salva</span>}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>ID Caso <span className="required-mark" aria-hidden="true">*</span></th>
                  <th style={{ padding: '8px' }}>Data Início <span className="required-mark" aria-hidden="true">*</span></th>
                  <th style={{ padding: '8px' }}>Data Fim <span className="required-mark" aria-hidden="true">*</span></th>
                  <th style={{ padding: '8px' }}>Tempo ({unidadeTmc}) <span className="required-mark" aria-hidden="true">*</span><span className="table-header-help">valor mínimo: 0</span></th>
                  <th style={{ padding: '8px' }}>Retrabalho?</th>
                  <th style={{ padding: '8px' }}>Observação</th>
                  <th style={{ padding: '8px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {casos.map((caso, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}><input className={`input ${indicadorId && !camposAlterados[`caso-${index}-identificadorCaso`] ? 'field-loaded-control' : ''} ${erros[`caso-${index}-identificadorCaso`] ? 'input-error' : ''}`} style={{ width: '72px' }} value={caso.identificadorCaso} onChange={(e) => atualizarCaso(index, 'identificadorCaso', e.target.value)} onBlur={() => validarCasoCampo(index, 'identificadorCaso')} required aria-required="true" />{erros[`caso-${index}-identificadorCaso`] && <span className="field-error">{erros[`caso-${index}-identificadorCaso`]}</span>}</td>
                    <td style={{ padding: '8px' }}><input type="date" className={`input ${indicadorId && !camposAlterados[`caso-${index}-dataInicio`] ? 'field-loaded-control' : ''} ${erros[`caso-${index}-dataInicio`] ? 'input-error' : ''}`} value={caso.dataInicio} onChange={(e) => atualizarCaso(index, 'dataInicio', e.target.value)} onBlur={() => validarCasoCampo(index, 'dataInicio')} required aria-required="true" />{erros[`caso-${index}-dataInicio`] && <span className="field-error">{erros[`caso-${index}-dataInicio`]}</span>}</td>
                    <td style={{ padding: '8px' }}><input type="date" className={`input ${indicadorId && !camposAlterados[`caso-${index}-dataFim`] ? 'field-loaded-control' : ''} ${erros[`caso-${index}-dataFim`] ? 'input-error' : ''}`} value={caso.dataFim} onChange={(e) => atualizarCaso(index, 'dataFim', e.target.value)} onBlur={() => validarCasoCampo(index, 'dataFim')} required aria-required="true" />{erros[`caso-${index}-dataFim`] && <span className="field-error">{erros[`caso-${index}-dataFim`]}</span>}</td>
                    <td style={{ padding: '8px' }}><input type="number" step="0.1" min="0" className={`input ${indicadorId && !camposAlterados[`caso-${index}-tempoTotal`] ? 'field-loaded-control' : ''} ${erros[`caso-${index}-tempoTotal`] ? 'input-error' : ''}`} style={{ width: '90px' }} value={caso.tempoTotal} onChange={(e) => atualizarCaso(index, 'tempoTotal', e.target.value)} onBlur={() => validarCasoCampo(index, 'tempoTotal')} required aria-required="true" />{erros[`caso-${index}-tempoTotal`] && <span className="field-error">{erros[`caso-${index}-tempoTotal`]}</span>}</td>
                    <td style={{ padding: '8px' }}>
                      <select className={`select ${indicadorId && !camposAlterados[`caso-${index}-houveRetrabalho`] ? 'field-loaded-control' : ''}`} value={caso.houveRetrabalho ? 'Sim' : 'Não'} onChange={(e) => atualizarCaso(index, 'houveRetrabalho', e.target.value === 'Sim')}>
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px', minWidth: '240px' }}><textarea className={`textarea long-text-control ${indicadorId && !camposAlterados[`caso-${index}-observacao`] ? 'field-loaded-control' : ''}`} rows={2} placeholder="Descreva o motivo de atraso/erro, se houver..." value={caso.observacao || ''} onChange={(e) => atualizarCaso(index, 'observacao', e.target.value)} /></td>
                    <td style={{ padding: '8px' }}><button type="button" onClick={() => removerCaso(index)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="field">
              <label className="label">Data Início Amostra <span className="field-help">(opcional)</span></label>
              <input type="date" className={`input ${indicadorId && !camposAlterados.dataInicioAmostra ? 'field-loaded-control' : ''} ${erros.dataInicioAmostra ? 'input-error' : ''}`} value={dataInicioAmostra} onChange={(e) => { setDataInicioAmostra(e.target.value); marcarAlterado('dataInicioAmostra'); if (erros.dataInicioAmostra) setErros((prev) => ({ ...prev, dataInicioAmostra: '' })); }} onBlur={validarPeriodoAmostra} />
              {indicadorId && !camposAlterados.dataInicioAmostra && <span className="field-state-hint">Valor carregado da ficha salva</span>}
              {erros.dataInicioAmostra && <span className="field-error">{erros.dataInicioAmostra}</span>}
            </div>
            <div className="field">
              <label className="label">Data Fim Amostra <span className="field-help">(opcional)</span></label>
              <input type="date" className={`input ${indicadorId && !camposAlterados.dataFimAmostra ? 'field-loaded-control' : ''} ${erros.dataFimAmostra ? 'input-error' : ''}`} value={dataFimAmostra} onChange={(e) => { setDataFimAmostra(e.target.value); marcarAlterado('dataFimAmostra'); if (erros.dataFimAmostra) setErros((prev) => ({ ...prev, dataFimAmostra: '' })); }} onBlur={validarPeriodoAmostra} />
              {indicadorId && !camposAlterados.dataFimAmostra && <span className="field-state-hint">Valor carregado da ficha salva</span>}
              {erros.dataFimAmostra && <span className="field-error">{erros.dataFimAmostra}</span>}
            </div>
          </div>
        </article>

        <article id="asis-satisfacao" className="card card-pad section-anchor-target" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 className="card-title">3. Avaliação de Satisfação (Enquete)</h2>
          <p className="card-description">Atribua notas na escala Likert de 1 (Péssimo/Confuso) a 5 (Muito Satisfeito/Claro).</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Critério A - Agilidade: "Como avalia o tempo total desde o seu pedido até a conclusão final?"</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map((nota) => (
                  <label key={nota} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="notaAgilidade" value={nota} checked={Number(notaAgilidade) === nota} onChange={() => { setNotaAgilidade(nota); marcarAlterado('notaAgilidade'); }} />
                    {nota} {nota === 1 ? '(Muito Insatisfeito)' : nota === 5 ? '(Muito Satisfeito)' : ''}
                  </label>
                ))}
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Critério B - Clareza: "Como avalia a facilidade e clareza das instruções fornecidas para realizar este pedido?"</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map((nota) => (
                  <label key={nota} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="notaClareza" value={nota} checked={Number(notaClareza) === nota} onChange={() => { setNotaClareza(nota); marcarAlterado('notaClareza'); }} />
                    {nota} {nota === 1 ? '(Muito Confuso)' : nota === 5 ? '(Muito Claro)' : ''}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={descartarAlteracoesFicha} disabled={carregando || !possuiAlteracoes}>
            {indicadorId ? 'Descartar alterações' : 'Limpar ficha'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={carregando} style={{ padding: '12px 24px', fontSize: '1rem' }}>
            {carregando ? 'Salvando...' : 'Salvar Ficha AS-IS'}
          </button>
        </div>
      </form>
    </div>
  );
};