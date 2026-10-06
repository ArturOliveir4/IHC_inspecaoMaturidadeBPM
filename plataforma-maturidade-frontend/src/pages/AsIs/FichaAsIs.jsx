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
  const [carregando, setCarregando] = useState(false);
  const restauracaoAutomaticaRealizada = useRef(false);

  useEffect(() => { carregarProcessos(); }, []);

  useEffect(() => {
    if (visao !== 'FICHA' || !processoSelecionado) return;
    localStorage.setItem(CHAVE_RASCUNHO_ASIS, JSON.stringify({ processoId: processoSelecionado.id, cicloAvaliacaoId, setorResponsavel, dataMedicao, responsavelAnalise, motivoPriorizacao, unidadeTmc, dataInicioAmostra, dataFimAmostra, notaAgilidade, notaClareza, casos, indicadorId, atualizadoEm: Date.now() }));
  }, [visao, processoSelecionado, cicloAvaliacaoId, setorResponsavel, dataMedicao, responsavelAnalise, motivoPriorizacao, unidadeTmc, dataInicioAmostra, dataFimAmostra, notaAgilidade, notaClareza, casos, indicadorId]);

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
  };

  const removerCaso = (index) => {
    if (casos.length === 1) {
      setFeedback({ tipo: 'danger', texto: 'A amostra deve ter ao menos 1 caso (N ≥ 1).' });
      return;
    }
    setCasos(casos.filter((_, i) => i !== index));
  };

  const atualizarCaso = (index, campo, valor) => {
    const novaLista = [...casos];
    novaLista[index] = { ...novaLista[index], [campo]: valor };
    setCasos(novaLista);
  };

  const handleSubmitFicha = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!responsavelAnalise.trim()) {
      setFeedback({ tipo: 'danger', texto: 'Informe o responsável pela análise.' });
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
    } catch (err) {
      setFeedback({ tipo: 'danger', texto: err.response?.data?.message || 'Erro ao salvar Ficha AS-IS.' });
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

            <form onSubmit={handleCadastrarProcesso} style={{ marginTop: '16px' }}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="label">Nome do Processo</label>
                <input className="input" placeholder="Ex: Solicitação de Histórico" value={novoProcesso.nome} onChange={(e) => setNovoProcesso({ ...novoProcesso, nome: e.target.value })} required />
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
          <h1 className="page-title" style={{ marginTop: '8px' }}>{processoSelecionado?.nome}</h1>
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

      <form onSubmit={handleSubmitFicha}>
        <article className="card card-pad" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 className="card-title">1. Contexto e Identificação</h2>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="field">
              <label className="label">Nome do Processo</label>
              <input className="input" value={processoSelecionado?.nome || ''} disabled style={{ background: '#f1f5f9' }} />
            </div>
            <div className="field">
              <label className="label">Setor Responsável</label>
              <input className="input" value={setorResponsavel} onChange={(e) => setSetorResponsavel(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Data da Medição</label>
              <input type="date" className="input" value={dataMedicao} onChange={(e) => setDataMedicao(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Responsável pela Análise</label>
              <input className="input" placeholder="Nome do analista" value={responsavelAnalise} onChange={(e) => setResponsavelAnalise(e.target.value)} required />
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label className="label">Motivo da Priorização</label>
              <select className="select" value={motivoPriorizacao} onChange={(e) => setMotivoPriorizacao(e.target.value)}>
                <option value="Falta de Padronização">Falta de Padronização</option>
                <option value="Baixa Tecnologia">Baixa Tecnologia</option>
                <option value="Alta Complexidade">Alta Complexidade</option>
              </select>
            </div>
          </div>
        </article>

        <article className="card card-pad" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">2. Amostras de Casos Reais (N = {kpisCalculados.N})</h2>
              <p className="card-description">Cadastre os casos observados para cálculo automático das métricas.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={adicionarCaso}>+ Adicionar Caso</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '16px' }}>
            <div className="field">
              <label className="label">Data Início Amostra</label>
              <input type="date" className="input" value={dataInicioAmostra} onChange={(e) => setDataInicioAmostra(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Data Fim Amostra</label>
              <input type="date" className="input" value={dataFimAmostra} onChange={(e) => setDataFimAmostra(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Unidade de Tempo</label>
              <select className="select" value={unidadeTmc} onChange={(e) => setUnidadeTmc(e.target.value)}>
                <option value="DIAS">Dias Úteis</option>
                <option value="HORAS">Horas</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>ID Caso</th>
                  <th style={{ padding: '8px' }}>Data Início</th>
                  <th style={{ padding: '8px' }}>Data Fim</th>
                  <th style={{ padding: '8px' }}>Tempo ({unidadeTmc})</th>
                  <th style={{ padding: '8px' }}>Retrabalho?</th>
                  <th style={{ padding: '8px' }}>Observação</th>
                  <th style={{ padding: '8px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {casos.map((caso, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}><input className="input" style={{ width: '60px' }} value={caso.identificadorCaso} onChange={(e) => atualizarCaso(index, 'identificadorCaso', e.target.value)} required /></td>
                    <td style={{ padding: '8px' }}><input type="date" className="input" value={caso.dataInicio} onChange={(e) => atualizarCaso(index, 'dataInicio', e.target.value)} required /></td>
                    <td style={{ padding: '8px' }}><input type="date" className="input" value={caso.dataFim} onChange={(e) => atualizarCaso(index, 'dataFim', e.target.value)} required /></td>
                    <td style={{ padding: '8px' }}><input type="number" step="0.1" min="0" className="input" style={{ width: '80px' }} value={caso.tempoTotal} onChange={(e) => atualizarCaso(index, 'tempoTotal', e.target.value)} required /></td>
                    <td style={{ padding: '8px' }}>
                      <select className="select" value={caso.houveRetrabalho ? 'Sim' : 'Não'} onChange={(e) => atualizarCaso(index, 'houveRetrabalho', e.target.value === 'Sim')}>
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}><input className="input" placeholder="Motivo de atraso/erro..." value={caso.observacao || ''} onChange={(e) => atualizarCaso(index, 'observacao', e.target.value)} /></td>
                    <td style={{ padding: '8px' }}><button type="button" onClick={() => removerCaso(index)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card card-pad" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 className="card-title">3. Avaliação de Satisfação (Enquete)</h2>
          <p className="card-description">Atribua notas na escala Likert de 1 (Péssimo/Confuso) a 5 (Muito Satisfeito/Claro).</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Critério A - Agilidade: "Como avalia o tempo total desde o seu pedido até a conclusão final?"</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[1, 2, 3, 4, 5].map((nota) => (
                  <label key={nota} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="notaAgilidade" value={nota} checked={Number(notaAgilidade) === nota} onChange={() => setNotaAgilidade(nota)} />
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
                    <input type="radio" name="notaClareza" value={nota} checked={Number(notaClareza) === nota} onChange={() => setNotaClareza(nota)} />
                    {nota} {nota === 1 ? '(Muito Confuso)' : nota === 5 ? '(Muito Claro)' : ''}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div style={{ textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary" disabled={carregando} style={{ padding: '12px 24px', fontSize: '1rem' }}>
            {carregando ? 'Salvando...' : 'Salvar Ficha AS-IS'}
          </button>
        </div>
      </form>
    </div>
  );
};