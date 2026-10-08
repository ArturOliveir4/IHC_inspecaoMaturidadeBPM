import React, { useEffect, useState, useCallback } from 'react';
import { alertaService } from '../../services/alertaService';
import { processoService } from '../../services/processoService';

const PERIODICIDADES = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'TRIMESTRAL', label: 'Trimestral' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
];

const FORM_INICIAL = {
  titulo: '',
  periodicidade: 'MENSAL',
  dataReferencia: '',
  gatilho: '',
  ativo: true,
};

export const AlertasAcompanhamento = () => {
  const [processos, setProcessos] = useState([]);
  const [processoId, setProcessoId] = useState('');
  const [alertas, setAlertas] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
  const [erros, setErros] = useState({});
  const [camposAlterados, setCamposAlterados] = useState({});

  // Carrega a lista de processos disponíveis para vincular o alerta (CA1).
  useEffect(() => {
    const carregarProcessos = async () => {
      try {
        const dados = await processoService.listarTodos();
        setProcessos(dados);
      } catch (err) {
        setFeedback({ tipo: 'danger', msg: 'Não foi possível carregar a lista de processos.' });
      }
    };
    carregarProcessos();
  }, []);

  const carregarAlertas = useCallback(async () => {
    if (!processoId) return;
    try {
      setLoading(true);
      const dados = await alertaService.listarPorProcesso(Number(processoId));
      setAlertas(dados);
    } catch (err) {
      setFeedback({ tipo: 'danger', msg: 'Erro ao carregar os alertas deste processo.' });
    } finally {
      setLoading(false);
    }
  }, [processoId]);

  useEffect(() => {
    carregarAlertas();
    limparFormulario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processoId]);

  const mensagemServidor = (error, fallback) => error.response?.data?.error || error.response?.data?.message || fallback;

  const validarCampo = (campo, valor = form[campo]) => {
    if (campo === 'processoId') return processoId ? '' : 'Selecione o processo ao qual o alerta será vinculado.';
    if (campo === 'titulo') return String(valor || '').trim() ? '' : 'Informe um título para o alerta.';
    if (campo === 'dataReferencia') return valor ? '' : 'Informe a data de referência.';
    if (campo === 'gatilho') return String(valor || '').trim() ? '' : 'Descreva a ação ou revisão que deverá ser realizada.';
    return '';
  };

  const atualizarErroCampo = (campo, valor) => {
    const mensagem = validarCampo(campo, valor);
    setErros((prev) => ({ ...prev, [campo]: mensagem }));
    return mensagem;
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setCamposAlterados((prev) => ({ ...prev, [campo]: true }));
    if (erros[campo]) atualizarErroCampo(campo, valor);
  };

  const limparFormulario = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setErros({});
    setCamposAlterados({});
  };

  const iniciarEdicao = (alerta) => {
    setEditandoId(alerta.id);
    setErros({});
    setCamposAlterados({});
    setForm({
      titulo: alerta.titulo,
      periodicidade: alerta.periodicidade,
      dataReferencia: alerta.dataReferencia,
      gatilho: alerta.gatilho,
      ativo: alerta.ativo,
    });
  };

  const salvarAlerta = async (event) => {
    event.preventDefault();
    const novosErros = {
      processoId: validarCampo('processoId'),
      titulo: validarCampo('titulo'),
      dataReferencia: validarCampo('dataReferencia'),
      gatilho: validarCampo('gatilho'),
    };
    setErros(novosErros);
    const primeiroErro = Object.entries(novosErros).find(([, mensagem]) => mensagem);
    if (primeiroErro) {
      document.getElementById(primeiroErro[0])?.focus();
      setFeedback({ tipo: 'danger', msg: 'Revise os campos destacados antes de salvar o alerta.' });
      return;
    }

    setFeedback({ tipo: '', msg: '' });
    try {
      setLoading(true);
      const payload = { ...form };
      if (editandoId) {
        await alertaService.atualizar(Number(processoId), editandoId, payload);
        setFeedback({ tipo: 'success', msg: 'Alerta atualizado com sucesso.' });
      } else {
        await alertaService.criar(Number(processoId), payload);
        setFeedback({ tipo: 'success', msg: 'Alerta de acompanhamento configurado com sucesso.' });
      }
      limparFormulario();
      await carregarAlertas();
    } catch (error) {
      const mensagemErro = mensagemServidor(error, 'Erro ao salvar o alerta de acompanhamento.');
      const mensagemNormalizada = mensagemErro.toLowerCase();
      if (mensagemNormalizada.includes('título')) setErros((prev) => ({ ...prev, titulo: mensagemErro }));
      else if (mensagemNormalizada.includes('gatilho')) setErros((prev) => ({ ...prev, gatilho: mensagemErro }));
      else if (mensagemNormalizada.includes('data de referência')) setErros((prev) => ({ ...prev, dataReferencia: mensagemErro }));
      else if (mensagemNormalizada.includes('processo')) setErros((prev) => ({ ...prev, processoId: mensagemErro }));
      setFeedback({ tipo: 'danger', msg: mensagemErro });
    } finally {
      setLoading(false);
    }
  };

  const excluirAlerta = async (alerta) => {
    if (!window.confirm(`Excluir o alerta "${alerta.titulo}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      setLoading(true);
      await alertaService.excluir(Number(processoId), alerta.id);
      setFeedback({ tipo: 'success', msg: 'Alerta excluído com sucesso.' });
      if (editandoId === alerta.id) {
        limparFormulario();
      }
      await carregarAlertas();
    } catch (error) {
      const mensagemErro = mensagemServidor(error, 'Erro ao excluir o alerta.');
      setFeedback({ tipo: 'danger', msg: mensagemErro });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (isoDate) => {
    if (!isoDate) return '-';
    const [ano, mes, dia] = isoDate.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Governança de processos</div>
          <h1 className="page-title">Alertas de Acompanhamento</h1>
          <p className="page-description">
            Configure lembretes periódicos de revisão para cada processo. As datas programadas
            alimentam o calendário de governança (US17) — não há envio de e-mail nem leitura
            automática de dados externos.
          </p>
        </div>
      </header>

      {feedback.msg && (
        <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>
          {feedback.msg}
        </div>
      )}

      <section className="grid grid-2">
        <article className="card card-pad">
          <h2 className="card-title">{editandoId ? 'Editar alerta' : 'Novo alerta de acompanhamento'}</h2>
          <div className="form-guidance">
            Configure o lembrete e escolha a data de referência. <strong>Campos marcados com * são obrigatórios.</strong>
            {editandoId ? ' Use “Atualizar alerta” para gravar as mudanças ou “Cancelar edição” para descartá-las.' : ' Use “Salvar alerta” para criar o registro.'}
          </div>
          {editandoId && (
            <div className="loaded-values-note">
              <strong>Valores carregados:</strong> campos com fundo azul vieram do alerta salvo; o destaque desaparece quando o valor é alterado.
            </div>
          )}

          <form onSubmit={salvarAlerta} style={{ marginTop: 10 }}>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="processoId">Processo<span className="required-mark" aria-hidden="true">*</span></label>
                <select
                  id="processoId"
                  className={`select ${erros.processoId ? 'input-error' : ''}`}
                  autoFocus
                  aria-required="true"
                  aria-invalid={Boolean(erros.processoId)}
                  aria-describedby={erros.processoId ? 'erro-processoId' : undefined}
                  value={processoId}
                  onChange={(e) => { setProcessoId(e.target.value); setErros((prev) => ({ ...prev, processoId: '' })); }}
                  onBlur={() => atualizarErroCampo('processoId', processoId)}
                  required
                >
                  <option value="" disabled>Selecione um processo</option>
                  {processos.map((processo) => (
                    <option key={processo.id} value={processo.id}>{processo.nome}</option>
                  ))}
                </select>
                {erros.processoId && <span id="erro-processoId" className="field-error">{erros.processoId}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="titulo">Título do alerta<span className="required-mark" aria-hidden="true">*</span></label>
                <textarea
                  id="titulo"
                  className={`textarea long-text-control ${editandoId && !camposAlterados.titulo ? 'field-loaded-control' : ''} ${erros.titulo ? 'input-error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(erros.titulo)}
                  aria-describedby={erros.titulo ? 'erro-titulo' : undefined}
                  placeholder="Ex.: Revisão semestral dos indicadores de desempenho do processo"
                  value={form.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  onBlur={(e) => atualizarErroCampo('titulo', e.target.value)}
                  rows={2}
                  required
                />
                {editandoId && !camposAlterados.titulo && <span className="field-state-hint">Valor carregado do alerta salvo</span>}
                {erros.titulo && <span id="erro-titulo" className="field-error">{erros.titulo}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="periodicidade">Periodicidade</label>
                <select
                  id="periodicidade"
                  className={`select ${editandoId && !camposAlterados.periodicidade ? 'field-loaded-control' : ''}`}
                  value={form.periodicidade}
                  onChange={(e) => handleChange('periodicidade', e.target.value)}
                >
                  {PERIODICIDADES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                  ))}
                </select>
                {!editandoId && !camposAlterados.periodicidade && <span className="field-state-hint">Valor padrão: Mensal</span>}
                {editandoId && !camposAlterados.periodicidade && <span className="field-state-hint">Valor carregado do alerta salvo</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="dataReferencia">Data de referência<span className="required-mark" aria-hidden="true">*</span></label>
                <input
                  id="dataReferencia"
                  className={`input ${editandoId && !camposAlterados.dataReferencia ? 'field-loaded-control' : ''} ${erros.dataReferencia ? 'input-error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(erros.dataReferencia)}
                  aria-describedby={erros.dataReferencia ? 'erro-dataReferencia' : undefined}
                  type="date"
                  value={form.dataReferencia}
                  onChange={(e) => handleChange('dataReferencia', e.target.value)}
                  onBlur={(e) => atualizarErroCampo('dataReferencia', e.target.value)}
                  required
                />
                {editandoId && !camposAlterados.dataReferencia && <span className="field-state-hint">Valor carregado do alerta salvo</span>}
                {erros.dataReferencia && <span id="erro-dataReferencia" className="field-error">{erros.dataReferencia}</span>}
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label" htmlFor="gatilho">Gatilho / ação pendente<span className="required-mark" aria-hidden="true">*</span></label>
                <textarea
                  id="gatilho"
                  className={`textarea ${editandoId && !camposAlterados.gatilho ? 'field-loaded-control' : ''} ${erros.gatilho ? 'input-error' : ''}`}
                  aria-required="true"
                  aria-invalid={Boolean(erros.gatilho)}
                  aria-describedby={erros.gatilho ? 'erro-gatilho' : undefined}
                  placeholder="Descreva o que deve ser revisado ou executado nesta data (ex.: revalidar KPIs TO-BE com o setor responsável)."
                  value={form.gatilho}
                  onChange={(e) => handleChange('gatilho', e.target.value)}
                  onBlur={(e) => atualizarErroCampo('gatilho', e.target.value)}
                  rows={4}
                  required
                />
                {editandoId && !camposAlterados.gatilho && <span className="field-state-hint">Valor carregado do alerta salvo</span>}
                {erros.gatilho && <span id="erro-gatilho" className="field-error">{erros.gatilho}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="ativo">Status</label>
                <select
                  id="ativo"
                  className={`select ${editandoId && !camposAlterados.ativo ? 'field-loaded-control' : ''}`}
                  value={form.ativo ? 'true' : 'false'}
                  onChange={(e) => handleChange('ativo', e.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
                {!editandoId && !camposAlterados.ativo && <span className="field-state-hint">Valor padrão: Ativo</span>}
                {editandoId && !camposAlterados.ativo && <span className="field-state-hint">Valor carregado do alerta salvo</span>}
              </div>
            </div>

            <div className="actions-row" style={{ marginTop: 18 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : editandoId ? 'Atualizar alerta' : 'Salvar alerta'}
              </button>
              {editandoId && (
                <button type="button" className="btn btn-ghost" onClick={limparFormulario} disabled={loading}>
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="card card-pad">
          <h2 className="card-title">Alertas configurados</h2>
          <p className="card-description">
            {processos.find((p) => String(p.id) === processoId)?.nome || 'Selecione um processo para visualizar seus alertas.'}
          </p>

          {alertas.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 16 }}>
              Nenhum alerta configurado para este processo ainda.
            </div>
          ) : (
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Próxima data</th>
                    <th>Status da Revisão</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => {
                    // CA1 e CA2: Cálculo de dias restantes para exibir os alertas
                    const hoje = new Date();
                    const proxima = new Date(alerta.proximaOcorrencia);
                    // Zera as horas para comparar apenas os dias
                    hoje.setHours(0, 0, 0, 0); 
                    proxima.setHours(0, 0, 0, 0);
                    
                    const diffDias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));
                    
                    let statusBadge = "badge-success";
                    let statusTexto = "No Prazo";
                    
                    if (diffDias < 0) {
                        statusBadge = "badge-danger";
                        statusTexto = "Revisão Pendente!";
                    } else if (diffDias <= 15) {
                        statusBadge = "badge-warning";
                        statusTexto = `Atenção: Vence em ${diffDias} dias`;
                    }

                    return (
                      <tr key={alerta.id} style={diffDias < 0 ? { backgroundColor: '#fef2f2' } : {}}>
                        <td>
                          <strong>{alerta.titulo}</strong>
                          <div style={{ fontSize: 12, color: 'var(--muted-strong)', marginTop: 4 }}>
                            {alerta.gatilho} | {PERIODICIDADES.find((p) => p.value === alerta.periodicidade)?.label}
                          </div>
                        </td>
                        <td style={{ fontWeight: diffDias <= 15 ? 'bold' : 'normal' }}>
                          {formatarData(alerta.proximaOcorrencia)}
                        </td>
                        <td>
                          <span className={`badge ${statusBadge}`}>
                            {statusTexto}
                          </span>
                        </td>
                        <td>
                          <div className="actions-row">
                            {/* CA3: Botão de ação rápida (1 clique) */}
                            <button 
                              type="button" 
                              className="btn btn-primary" 
                              style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '8px' }}
                              onClick={async () => {
                                if(window.confirm("Confirmar a conclusão da revisão deste ciclo?")) {
                                  try {
                                    setLoading(true);
                                    // Adicione este método ao seu alertaService.js apontando para o backend
                                    await alertaService.concluirRevisao(Number(processoId), alerta.id); 
                                    await carregarAlertas();
                                    setFeedback({ tipo: 'success', msg: 'Revisão registrada! Próximo ciclo agendado.' });
                                  } catch(e) {
                                    setFeedback({ tipo: 'danger', msg: 'Erro ao concluir revisão.' });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                            >
                              Concluir Revisão
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => iniciarEdicao(alerta)}>✏️</button>
                            <button type="button" className="btn btn-ghost" style={{ color: 'red' }} onClick={() => excluirAlerta(alerta)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};
