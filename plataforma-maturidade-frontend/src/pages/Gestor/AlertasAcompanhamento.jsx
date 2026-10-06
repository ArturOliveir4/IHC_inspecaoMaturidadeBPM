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

  // Carrega a lista de processos disponíveis para vincular o alerta (CA1).
  useEffect(() => {
    const carregarProcessos = async () => {
      try {
        const dados = await processoService.listarTodos();
        setProcessos(dados);
        if (dados.length > 0) {
          setProcessoId(String(dados[0].id));
        }
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

  const handleChange = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const limparFormulario = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  };

  const iniciarEdicao = (alerta) => {
    setEditandoId(alerta.id);
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
    if (!processoId) {
      setFeedback({ tipo: 'danger', msg: 'Selecione um processo antes de salvar o alerta.' });
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
      const mensagemErro = error.response?.data?.error || 'Erro ao salvar o alerta de acompanhamento.';
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
      const mensagemErro = error.response?.data?.error || 'Erro ao excluir o alerta.';
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

          <form onSubmit={salvarAlerta} style={{ marginTop: 10 }}>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="processoId">Processo</label>
                <select
                  id="processoId"
                  className="select"
                  value={processoId}
                  onChange={(e) => setProcessoId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um processo</option>
                  {processos.map((processo) => (
                    <option key={processo.id} value={processo.id}>{processo.nome}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="titulo">Título do alerta</label>
                <input
                  id="titulo"
                  className="input"
                  placeholder="Ex.: Revisão do mapeamento AS-IS"
                  value={form.titulo}
                  onChange={(e) => handleChange('titulo', e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="periodicidade">Periodicidade</label>
                <select
                  id="periodicidade"
                  className="select"
                  value={form.periodicidade}
                  onChange={(e) => handleChange('periodicidade', e.target.value)}
                >
                  {PERIODICIDADES.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="dataReferencia">Data de referência</label>
                <input
                  id="dataReferencia"
                  className="input"
                  type="date"
                  value={form.dataReferencia}
                  onChange={(e) => handleChange('dataReferencia', e.target.value)}
                  required
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label" htmlFor="gatilho">Gatilho / ação pendente</label>
                <textarea
                  id="gatilho"
                  className="textarea"
                  placeholder="Descreva o que deve ser revisado ou executado nesta data (ex.: revalidar KPIs TO-BE com o setor responsável)."
                  value={form.gatilho}
                  onChange={(e) => handleChange('gatilho', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="ativo">Status</label>
                <select
                  id="ativo"
                  className="select"
                  value={form.ativo ? 'true' : 'false'}
                  onChange={(e) => handleChange('ativo', e.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
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
