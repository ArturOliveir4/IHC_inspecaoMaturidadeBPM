import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { processoService } from '../../services/processoService';
import { planoGovernancaService } from '../../services/planoGovernancaService';
import { instrumentoMonitoramentoService } from '../../services/instrumentoMonitoramentoService';

const PERIODICIDADES = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' }
];

const CHAVE_PLANO_SUJO = '@MaturidadeBPM:plano-governanca:alteracoes-nao-salvas';

const FORM_INICIAL = {
  processoId: '', donoProcesso: '', instrumentoMonitoramentoId: '',
  periodicidadeRevisao: 'MENSAL', gatilhosNovoCiclo: '',
};

const formatarDataHora = (valor) => valor
  ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
  : '-';

export function PlanoGovernanca() {
  const [processos, setProcessos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  
  // Estados para o Checklist
  const [checklist, setChecklist] = useState(null);
  const [statusChecklist, setStatusChecklist] = useState(''); // 'salvando', 'salvo', 'erro'
  const debounceTimer = useRef(null);

  const [loading, setLoading] = useState(true);
  const [carregandoInstrumentos, setCarregandoInstrumentos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
  const [erros, setErros] = useState({});
  const [camposAlterados, setCamposAlterados] = useState({});

  const possuiAlteracoesNaoSalvas = Object.keys(camposAlterados).length > 0;

  const planoSelecionado = useMemo(
    () => planos.find((item) => String(item.processoId) === String(form.processoId)),
    [planos, form.processoId],
  );

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [listaProcessos, listaPlanos, dadosChecklist] = await Promise.all([
        processoService.listarPriorizados(),
        planoGovernancaService.listarVigentes(),
        planoGovernancaService.buscarChecklist() // 👇 AQUI: Usando o serviço correto
      ]);
      setProcessos(listaProcessos);
      setPlanos(listaPlanos);
      setChecklist(dadosChecklist);
    } catch (error) {
      setFeedback({ tipo: 'danger', msg: 'Erro ao carregar a página.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  useEffect(() => {
    if (possuiAlteracoesNaoSalvas) sessionStorage.setItem(CHAVE_PLANO_SUJO, 'true');
    else sessionStorage.removeItem(CHAVE_PLANO_SUJO);

    const avisarAntesDeSair = (event) => {
      if (!possuiAlteracoesNaoSalvas) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', avisarAntesDeSair);
    return () => window.removeEventListener('beforeunload', avisarAntesDeSair);
  }, [possuiAlteracoesNaoSalvas]);

  useEffect(() => () => sessionStorage.removeItem(CHAVE_PLANO_SUJO), []);

  // Função de Salvamento Automático (CA3)
  const handleChecklistChange = (campo, valor) => {
    const novoChecklist = { ...checklist, [campo]: valor };
    
    // Atualização otimista na tela (CA2)
    const concluidos = [novoChecklist.tabelaPreenchida, novoChecklist.donosConcordaram, novoChecklist.calendarioInserido].filter(Boolean).length;
    novoChecklist.percentualConclusao = Math.round((concluidos * 100) / 3);
    
    setChecklist(novoChecklist);
    setStatusChecklist('salvando');

    // Debounce: Aguarda 1 segundo sem digitar para salvar no banco
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await planoGovernancaService.salvarChecklist(novoChecklist); // 👇 AQUI: Usando o serviço correto
        setStatusChecklist('salvo');
        setTimeout(() => setStatusChecklist(''), 2000); // Limpa o status após 2s
      } catch (error) {
        setStatusChecklist('erro');
      }
    }, 1000);
  };

  const selecionarProcesso = async (processoId, opcoes = {}) => {
    const mudouDeProcesso = String(processoId || '') !== String(form.processoId || '');
    if (!opcoes.ignorarConfirmacao && mudouDeProcesso && possuiAlteracoesNaoSalvas) {
      const confirmar = window.confirm('Existem alterações não salvas neste plano. Deseja descartá-las e trocar de processo?');
      if (!confirmar) return;
    }
    const existente = planos.find((item) => String(item.processoId) === String(processoId));
    setForm(existente ? {
      processoId: String(existente.processoId),
      donoProcesso: existente.donoProcesso,
      instrumentoMonitoramentoId: String(existente.instrumentoMonitoramentoId),
      periodicidadeRevisao: existente.periodicidadeRevisao,
      gatilhosNovoCiclo: existente.gatilhosNovoCiclo,
    } : { ...FORM_INICIAL, processoId: String(processoId) });
    setInstrumentos([]); setHistorico([]); setFeedback({ tipo: '', msg: '' });
    setErros({}); setCamposAlterados({});
    if (processoId) {
      setCarregandoInstrumentos(true);
      try {
        const [listaInstrumentos, listaHistorico] = await Promise.all([
          instrumentoMonitoramentoService.listarPorProcesso(Number(processoId)),
          planoGovernancaService.listarHistorico(Number(processoId)),
        ]);
        setInstrumentos(listaInstrumentos); setHistorico(listaHistorico);
      } finally { setCarregandoInstrumentos(false); }
    }
  };

  const mensagemServidor = (error, fallback) => error.response?.data?.error || error.response?.data?.message || fallback;

  const validarCampo = (campo, valor = form[campo]) => {
    if (campo === 'processoId') return valor ? '' : 'Selecione um processo priorizado.';
    if (campo === 'donoProcesso') return String(valor || '').trim() ? '' : 'Informe o dono do processo.';
    if (campo === 'instrumentoMonitoramentoId') return valor ? '' : 'Selecione um instrumento de monitoramento.';
    if (campo === 'periodicidadeRevisao') return valor ? '' : 'Selecione a periodicidade de revisão.';
    if (campo === 'gatilhosNovoCiclo') return String(valor || '').trim() ? '' : 'Descreva os gatilhos para iniciar um novo ciclo.';
    return '';
  };

  const atualizarErroCampo = (campo, valor) => {
    const mensagem = validarCampo(campo, valor);
    setErros((prev) => ({ ...prev, [campo]: mensagem }));
    return mensagem;
  };

  const alterarCampo = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setCamposAlterados((prev) => ({ ...prev, [campo]: true }));
    if (erros[campo]) atualizarErroCampo(campo, valor);
  };

  const irParaSecao = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const confirmarSaidaDoPlano = () => {
    if (!possuiAlteracoesNaoSalvas) return true;
    const confirmar = window.confirm('Existem alterações não salvas no Plano de Governança. Deseja sair e descartá-las?');
    if (confirmar) sessionStorage.removeItem(CHAVE_PLANO_SUJO);
    return confirmar;
  };

  const cancelarOuLimparPlano = async () => {
    if (possuiAlteracoesNaoSalvas && !window.confirm('Descartar as alterações atuais do Plano de Governança?')) return;
    const processoAtual = form.processoId;
    setErros({});
    setCamposAlterados({});
    sessionStorage.removeItem(CHAVE_PLANO_SUJO);
    if (planoSelecionado && processoAtual) {
      await selecionarProcesso(processoAtual, { ignorarConfirmacao: true });
      setFeedback({ tipo: 'info', msg: 'Alterações descartadas. O plano vigente foi restaurado.' });
    } else {
      setForm(FORM_INICIAL);
      setInstrumentos([]);
      setHistorico([]);
      setFeedback({ tipo: 'info', msg: 'Formulário limpo. Nenhuma alteração foi salva.' });
    }
  };

  const salvar = async (event) => {
    event.preventDefault();
    const novosErros = {
      processoId: validarCampo('processoId'),
      donoProcesso: validarCampo('donoProcesso'),
      instrumentoMonitoramentoId: validarCampo('instrumentoMonitoramentoId'),
      periodicidadeRevisao: validarCampo('periodicidadeRevisao'),
      gatilhosNovoCiclo: validarCampo('gatilhosNovoCiclo'),
    };
    setErros(novosErros);
    const primeiroErro = Object.entries(novosErros).find(([, mensagem]) => mensagem);
    if (primeiroErro) {
      const ids = {
        processoId: 'gov-processo', donoProcesso: 'gov-dono', instrumentoMonitoramentoId: 'gov-instrumento',
        periodicidadeRevisao: 'gov-periodicidade', gatilhosNovoCiclo: 'gov-gatilhos'
      };
      document.getElementById(ids[primeiroErro[0]])?.focus();
      setFeedback({ tipo: 'danger', msg: 'Revise os campos destacados antes de salvar o plano.' });
      return;
    }

    setSalvando(true); setFeedback({ tipo: '', msg: '' });
    try {
      await planoGovernancaService.salvar({
        ...form, processoId: Number(form.processoId), instrumentoMonitoramentoId: Number(form.instrumentoMonitoramentoId),
      });
      setFeedback({ tipo: 'success', msg: planoSelecionado ? 'Nova versão do plano salva.' : 'Plano cadastrado com sucesso.' });
      await carregarDados();
      setHistorico(await planoGovernancaService.listarHistorico(Number(form.processoId)));
      setErros({});
      setCamposAlterados({});
      sessionStorage.removeItem(CHAVE_PLANO_SUJO);
    } catch (error) {
      const mensagemErro = mensagemServidor(error, 'Erro ao salvar o plano.');
      const normalizada = mensagemErro.toLowerCase();
      if (normalizada.includes('dono')) setErros((prev) => ({ ...prev, donoProcesso: mensagemErro }));
      else if (normalizada.includes('instrumento')) setErros((prev) => ({ ...prev, instrumentoMonitoramentoId: mensagemErro }));
      else if (normalizada.includes('periodicidade')) setErros((prev) => ({ ...prev, periodicidadeRevisao: mensagemErro }));
      else if (normalizada.includes('gatilho')) setErros((prev) => ({ ...prev, gatilhosNovoCiclo: mensagemErro }));
      else if (normalizada.includes('processo')) setErros((prev) => ({ ...prev, processoId: mensagemErro }));
      setFeedback({ tipo: 'danger', msg: mensagemErro });
    } finally { setSalvando(false); }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Governança de processos</div>
          <h1 className="page-title">Tabela do Plano de Governança</h1>
          <p className="page-description">Defina responsáveis, instrumento, periodicidade e gatilhos para o acompanhamento dos processos priorizados.</p>
        </div>
      </header>
      
      {feedback.msg && <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>{feedback.msg}</div>}
      
      <div className="actions-row" style={{ marginBottom: 18 }}>
        <Link className="btn btn-secondary" to="/gestor/configuracao-governanca" onClick={(event) => { if (!confirmarSaidaDoPlano()) event.preventDefault(); }}>Priorizar processos</Link>
      </div>

      <nav className="section-jump-nav" aria-label="Atalhos para seções do Plano de Governança">
        <span className="section-jump-label">Ir para:</span>
        <button type="button" className="section-jump-link" onClick={() => irParaSecao('gov-formulario')}>Formulário</button>
        <button type="button" className="section-jump-link" onClick={() => irParaSecao('gov-matriz')}>Matriz</button>
        {checklist && <button type="button" className="section-jump-link" onClick={() => irParaSecao('gov-checklist')}>Checklist</button>}
        {form.processoId && <button type="button" className="section-jump-link" onClick={() => irParaSecao('gov-historico')}>Histórico</button>}
      </nav>

      <section id="gov-formulario" className="card card-pad section-anchor-target" style={{ marginBottom: 18 }}>
        <h2 className="card-title">{planoSelecionado ? 'Editar plano vigente' : 'Cadastrar plano'}</h2>
        <div className="form-guidance">
          Selecione primeiro o processo priorizado para habilitar o instrumento de monitoramento.
          <strong> Campos marcados com * são obrigatórios.</strong> Ao editar um plano vigente, o salvamento cria uma nova versão. O checklist abaixo é salvo automaticamente.
        </div>
        {planoSelecionado && (
          <div className="loaded-values-note">
            <strong>Valores carregados:</strong> campos com fundo azul pertencem ao plano vigente. O destaque desaparece quando o usuário modifica o valor.
          </div>
        )}
        <form onSubmit={salvar} style={{ marginTop: 16 }}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="gov-processo">Processo priorizado<span className="required-mark" aria-hidden="true">*</span></label>
              <select id="gov-processo" className={`select ${planoSelecionado ? 'field-loaded-control' : ''} ${erros.processoId ? 'input-error' : ''}`} autoFocus aria-required="true" aria-invalid={Boolean(erros.processoId)} aria-describedby={erros.processoId ? 'erro-gov-processo' : undefined} value={form.processoId} onChange={(e) => selecionarProcesso(e.target.value)} onBlur={(e) => atualizarErroCampo('processoId', e.target.value)} required>
                <option value="">Selecione um processo</option>
                {processos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              {planoSelecionado && <span className="field-state-hint">Plano vigente selecionado</span>}
              {erros.processoId && <span id="erro-gov-processo" className="field-error">{erros.processoId}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="gov-dono">Dono do processo<span className="required-mark" aria-hidden="true">*</span></label>
              <input id="gov-dono" className={`input ${planoSelecionado && !camposAlterados.donoProcesso ? 'field-loaded-control' : ''} ${erros.donoProcesso ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.donoProcesso)} aria-describedby={erros.donoProcesso ? 'erro-gov-dono' : undefined} value={form.donoProcesso} onChange={(e) => alterarCampo('donoProcesso', e.target.value)} onBlur={(e) => atualizarErroCampo('donoProcesso', e.target.value)} required />
              {planoSelecionado && !camposAlterados.donoProcesso && <span className="field-state-hint">Valor carregado do plano vigente</span>}
              {erros.donoProcesso && <span id="erro-gov-dono" className="field-error">{erros.donoProcesso}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="gov-instrumento">Instrumento de monitoramento<span className="required-mark" aria-hidden="true">*</span></label>
              <select id="gov-instrumento" className={`select ${planoSelecionado && !camposAlterados.instrumentoMonitoramentoId ? 'field-loaded-control' : ''} ${erros.instrumentoMonitoramentoId ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.instrumentoMonitoramentoId)} aria-describedby={erros.instrumentoMonitoramentoId ? 'erro-gov-instrumento' : undefined} value={form.instrumentoMonitoramentoId} onChange={(e) => alterarCampo('instrumentoMonitoramentoId', e.target.value)} onBlur={(e) => atualizarErroCampo('instrumentoMonitoramentoId', e.target.value)} disabled={!form.processoId || carregandoInstrumentos} required>
                <option value="">{carregandoInstrumentos ? 'Carregando...' : 'Selecione'}</option>
                {instrumentos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
              {!form.processoId && <span className="field-help">Selecione um processo para habilitar este campo.</span>}
              {form.processoId && carregandoInstrumentos && <span className="field-help">Carregando instrumentos disponíveis...</span>}
              {planoSelecionado && !carregandoInstrumentos && !camposAlterados.instrumentoMonitoramentoId && <span className="field-state-hint">Valor carregado do plano vigente</span>}
              {erros.instrumentoMonitoramentoId && <span id="erro-gov-instrumento" className="field-error">{erros.instrumentoMonitoramentoId}</span>}
            </div>
            <div className="field">
              <label className="label" htmlFor="gov-periodicidade">Periodicidade<span className="required-mark" aria-hidden="true">*</span></label>
              <select id="gov-periodicidade" className={`select ${planoSelecionado && !camposAlterados.periodicidadeRevisao ? 'field-loaded-control' : ''} ${erros.periodicidadeRevisao ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.periodicidadeRevisao)} aria-describedby={erros.periodicidadeRevisao ? 'erro-gov-periodicidade' : undefined} value={form.periodicidadeRevisao} onChange={(e) => alterarCampo('periodicidadeRevisao', e.target.value)} onBlur={(e) => atualizarErroCampo('periodicidadeRevisao', e.target.value)} required>
                {PERIODICIDADES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              {!planoSelecionado && !camposAlterados.periodicidadeRevisao && <span className="field-state-hint">Valor padrão: Mensal</span>}
              {planoSelecionado && !camposAlterados.periodicidadeRevisao && <span className="field-state-hint">Valor carregado do plano vigente</span>}
              {erros.periodicidadeRevisao && <span id="erro-gov-periodicidade" className="field-error">{erros.periodicidadeRevisao}</span>}
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label" htmlFor="gov-gatilhos">Gatilhos para novo ciclo<span className="required-mark" aria-hidden="true">*</span></label>
              <textarea id="gov-gatilhos" className={`textarea ${planoSelecionado && !camposAlterados.gatilhosNovoCiclo ? 'field-loaded-control' : ''} ${erros.gatilhosNovoCiclo ? 'input-error' : ''}`} aria-required="true" aria-invalid={Boolean(erros.gatilhosNovoCiclo)} aria-describedby={erros.gatilhosNovoCiclo ? 'erro-gov-gatilhos' : undefined} rows={4} value={form.gatilhosNovoCiclo} onChange={(e) => alterarCampo('gatilhosNovoCiclo', e.target.value)} onBlur={(e) => atualizarErroCampo('gatilhosNovoCiclo', e.target.value)} required />
              {planoSelecionado && !camposAlterados.gatilhosNovoCiclo && <span className="field-state-hint">Valor carregado do plano vigente</span>}
              {erros.gatilhosNovoCiclo && <span id="erro-gov-gatilhos" className="field-error">{erros.gatilhosNovoCiclo}</span>}
            </div>
          </div>
          <div className="actions-row" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="submit" disabled={salvando || loading}>{salvando ? 'Salvando...' : 'Salvar plano'}</button>
            <button className="btn btn-secondary" type="button" onClick={cancelarOuLimparPlano} disabled={salvando || loading || (!form.processoId && !possuiAlteracoesNaoSalvas)}>
              {planoSelecionado ? 'Cancelar edição' : 'Limpar formulário'}
            </button>
            {possuiAlteracoesNaoSalvas && <span className="unsaved-indicator" role="status">Alterações não salvas</span>}
          </div>
        </form>
      </section>

      <section id="gov-matriz" className="card card-pad section-anchor-target" style={{ marginBottom: 18 }}>
        <h2 className="card-title">Matriz de governança consolidada</h2>
        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <table className="table">
            <thead><tr><th>Processo</th><th>Dono</th><th>Periodicidade</th><th>Versão</th><th>Ação</th></tr></thead>
            <tbody>
              {planos.length === 0 && <tr><td colSpan="5">Nenhum plano cadastrado.</td></tr>}
              {planos.map((p) => (
                <tr key={p.id}>
                  <td>{p.processoNome}</td><td>{p.donoProcesso}</td><td>{p.periodicidadeRevisao}</td><td>v{p.versao}</td>
                  <td><button type="button" className="btn btn-secondary" onClick={() => selecionarProcesso(p.processoId)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Checklist de Conclusão */}
      {checklist && (
        <section id="gov-checklist" className="card card-pad section-anchor-target" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title" style={{ margin: 0 }}>✅ Checklist de Conclusão do Plano</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {statusChecklist === 'salvando' && <span style={{ color: '#666', fontSize: '12px' }}>Salvando alterações... ⏳</span>}
              {statusChecklist === 'salvo' && <span style={{ color: 'green', fontSize: '12px', fontWeight: 'bold' }}>Salvo automaticamente! ✅</span>}
              {statusChecklist === 'erro' && <span style={{ color: 'red', fontSize: '12px' }}>Erro ao salvar ❌</span>}
              <div className="badge badge-primary" style={{ fontSize: '16px', padding: '8px 12px' }}>
                Progresso: {checklist.percentualConclusao}%
              </div>
            </div>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Nº</th>
                <th>Verificação</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.</td>
                <td>A Tabela acima foi preenchida com os nomes reais dos servidores?</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checklist.tabelaPreenchida} onChange={(e) => handleChecklistChange('tabelaPreenchida', e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </td>
                <td><textarea className="textarea long-text-control" rows={2} placeholder="Opcional..." value={checklist.obsTabelaPreenchida || ''} onChange={(e) => handleChecklistChange('obsTabelaPreenchida', e.target.value)} /></td>
              </tr>
              <tr>
                <td>2.</td>
                <td>Os Donos dos Processos concordaram com suas atribuições?</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checklist.donosConcordaram} onChange={(e) => handleChecklistChange('donosConcordaram', e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </td>
                <td><textarea className="textarea long-text-control" rows={2} placeholder="Opcional..." value={checklist.obsDonosConcordaram || ''} onChange={(e) => handleChecklistChange('obsDonosConcordaram', e.target.value)} /></td>
              </tr>
              <tr>
                <td>3.</td>
                <td>O calendário de reuniões de monitoramento foi inserido na agenda da CRPA?</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checklist.calendarioInserido} onChange={(e) => handleChecklistChange('calendarioInserido', e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </td>
                <td><textarea className="textarea long-text-control" rows={2} placeholder="Opcional..." value={checklist.obsCalendarioInserido || ''} onChange={(e) => handleChecklistChange('obsCalendarioInserido', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {form.processoId && (
        <section id="gov-historico" className="card card-pad section-anchor-target">
          <h2 className="card-title">Histórico de versões</h2>
          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table className="table">
              <thead><tr><th>Versão</th><th>Status</th><th>Registrado em</th></tr></thead>
              <tbody>
                {historico.map((item) => <tr key={item.id}><td>v{item.versao}</td><td>{item.vigente ? 'Vigente' : 'Anterior'}</td><td>{formatarDataHora(item.criadoEm)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}