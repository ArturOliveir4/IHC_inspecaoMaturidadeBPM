import React, { useState, useEffect, useMemo } from 'react';
import { toBeService } from '../../services/toBeService';
import api from '../../services/api'; // Adicionando a API para buscar a lista de processos

const CHAVE_RASCUNHO_TOBE = '@MaturidadeBPM:kpi-to-be:rascunho';

export const FichaToBe = () => {
  // 👇 NOVO: Estado para guardar a lista de processos que vem do banco
  const [processos, setProcessos] = useState([]);
  
  const rascunhoInicial = (() => { try { return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO_TOBE)) || {}; } catch { return {}; } })();
  const [processoId, setProcessoId] = useState(rascunhoInicial.processoId || '');
  const [indicadorId, setIndicadorId] = useState(rascunhoInicial.indicadorId || null); 

  const [form, setForm] = useState(rascunhoInicial.form || {
    cicloAvaliacaoId: '1',
    tmc: '',
    unidadeTmc: 'DIAS',
    tr: '',
    ns: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

  // 👇 NOVO: Busca a lista de processos assim que a tela abre
  useEffect(() => {
    const carregarProcessos = async () => {
      try {
        const res = await api.get('/processos');
        if (Array.isArray(res.data)) {
          setProcessos(res.data);
        } else if (res.data && Array.isArray(res.data.content)) {
          setProcessos(res.data.content);
        }
      } catch (err) {
        console.error("Erro ao buscar processos", err);
        setFeedback({ tipo: 'danger', msg: 'Não foi possível carregar a lista de processos.' });
      }
    };
    carregarProcessos();
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAVE_RASCUNHO_TOBE, JSON.stringify({ processoId, indicadorId, form, atualizadoEm: Date.now() }));
  }, [processoId, indicadorId, form]);

  const payload = useMemo(() => ({
    cicloAvaliacaoId: Number(form.cicloAvaliacaoId),
    tmc: Number(form.tmc),
    unidadeTmc: form.unidadeTmc,
    tr: Number(form.tr),
    ns: Number(form.ns),
  }), [form]);

  const carregarKpisExistentes = async () => {
    if (!processoId || !form.cicloAvaliacaoId) {
      setFeedback({ tipo: 'warning', msg: 'Selecione um processo antes de buscar.' });
      return;
    }
    try {
      setLoading(true);
      setFeedback({ tipo: '', msg: '' });
      const dados = await toBeService.buscarKpis(Number(processoId), Number(form.cicloAvaliacaoId));
      if (dados) {
        setIndicadorId(dados.id); 
        setForm({
          cicloAvaliacaoId: String(dados.cicloAvaliacaoId),
          tmc: String(dados.tmc),
          unidadeTmc: dados.unidadeTmc,
          tr: String(dados.tr),
          ns: String(dados.ns),
        });
        setFeedback({ tipo: 'info', msg: 'Dados do cenário TO-BE carregados do banco de dados.' });
      }
    } catch (err) {
      setIndicadorId(null); 
      setFeedback({ tipo: 'warning', msg: 'Nenhum registro prévio encontrado para este ciclo. Insira as metas abaixo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const salvarMetaToBe = async (event) => {
    event.preventDefault();
    setFeedback({ tipo: '', msg: '' });
    
    if (!processoId) {
      setFeedback({ tipo: 'warning', msg: 'Por favor, selecione um processo na lista.' });
      return;
    }
    
    try {
      setLoading(true);
      let resposta;

      if (indicadorId) {
        resposta = await toBeService.editarKpi(Number(processoId), indicadorId, payload);
        setFeedback({ tipo: 'success', msg: `Metas atualizadas com sucesso!` });
      } else {
        resposta = await toBeService.cadastrarKpi(Number(processoId), payload);
        setIndicadorId(resposta.id); 
        setFeedback({ tipo: 'success', msg: `Metas salvas no banco com sucesso!` });
      }
      localStorage.removeItem(CHAVE_RASCUNHO_TOBE);

    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao conectar ao servidor backend.';
      setFeedback({ tipo: 'danger', msg: mensagemErro });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">TO-BE do processo</div>
          <h1 className="page-title">Definição do Cenário Futuro (Banco Real)</h1>
          <p className="page-description">Cadastre as metas e os indicadores esperados diretamente na base PostgreSQL.</p>
        </div>
        <span className="badge badge-success">Conectado ao BD</span>
      </header>

      {feedback.msg && (
        <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>
          {feedback.msg}
        </div>
      )}

      <section className="grid grid-1">
        <article className="card card-pad">
          <h2 className="card-title">Indicadores de Meta (TO-BE)</h2>
          
          <div className="actions-row" style={{ marginTop: 8, marginBottom: 16 }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={carregarKpisExistentes} 
              disabled={loading || !processoId}
            >
              {loading ? 'Buscando...' : '🔍 Buscar metas salvas no banco'}
            </button>
          </div>

          <form onSubmit={salvarMetaToBe} style={{ marginTop: 10 }}>
            <div className="form-grid">
              
              {/* 👇 NOVO: Transformamos o campo de texto num Select que usa os nomes */}
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label className="label" htmlFor="processoId">Processo</label>
                <select 
                  id="processoId" 
                  className="select" 
                  value={processoId} 
                  onChange={(e) => {
                    setProcessoId(e.target.value);
                    setIndicadorId(null); 
                  }} 
                  required
                >
                  <option value="">Selecione um processo...</option>
                  {processos.map(proc => (
                    <option key={proc.id} value={proc.id}>
                      {proc.nome} (Criado em: {new Date(proc.criadoEm).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="cicloAvaliacaoId">Ciclo de Avaliação</label>
                <input id="cicloAvaliacaoId" className="input" type="number" min="1" value={form.cicloAvaliacaoId} onChange={(e) => {
                  handleChange('cicloAvaliacaoId', e.target.value);
                  setIndicadorId(null); 
                }} required />
              </div>
              
              <div className="field"></div> {/* Espaço vazio para alinhar o grid */}

              <div className="field">
                <label className="label" htmlFor="tmc">Meta: Tempo médio de ciclo</label>
                <input id="tmc" className="input" type="number" min="0" step="0.1" required value={form.tmc} onChange={(e) => handleChange('tmc', e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="unidadeTmc">Unidade</label>
                <select id="unidadeTmc" className="select" value={form.unidadeTmc} onChange={(e) => handleChange('unidadeTmc', e.target.value)}>
                  <option value="DIAS">Dias</option>
                  <option value="HORAS">Horas</option>
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="tr">Meta: Retrabalho (%)</label>
                <input id="tr" className="input" type="number" min="0" max="100" step="0.1" required value={form.tr} onChange={(e) => handleChange('tr', e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="ns">Meta: Satisfação (1 a 5)</label>
                <input id="ns" className="input" type="number" min="1" max="5" step="1" required value={form.ns} onChange={(e) => handleChange('ns', e.target.value)} />
              </div>
            </div>
            <div className="actions-row" style={{ marginTop: 18 }}>
              <button type="submit" className="btn btn-primary" disabled={loading || !processoId}>
                {loading ? 'Processando...' : (indicadorId ? 'Atualizar metas no PostgreSQL' : 'Salvar metas no PostgreSQL')}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
};