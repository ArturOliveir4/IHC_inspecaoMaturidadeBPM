import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { processoService } from '../../services/processoService';
import { instrumentoMonitoramentoService } from '../../services/instrumentoMonitoramentoService';

const erroMsg = (error, fallback) => error.response?.data?.error || error.response?.data?.message || fallback;

export function ConfiguracaoGovernanca() {
  const [processos, setProcessos] = useState([]);
  const [processoId, setProcessoId] = useState('');
  const [instrumentos, setInstrumentos] = useState([]);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
  const [ocupado, setOcupado] = useState(false);

  const carregarProcessos = async () => {
    try { setProcessos(await processoService.listarTodos()); }
    catch (error) { setFeedback({ tipo: 'danger', msg: erroMsg(error, 'Não foi possível carregar os processos.') }); }
  };

  useEffect(() => { carregarProcessos(); }, []);

  const alternarPriorizacao = async (processo) => {
    setOcupado(true); setFeedback({ tipo: '', msg: '' });
    try {
      await processoService.atualizarPriorizacao(processo.id, !processo.priorizado);
      await carregarProcessos();
      if (processo.priorizado && String(processo.id) === processoId) { setProcessoId(''); setInstrumentos([]); }
      setFeedback({ tipo: 'success', msg: processo.priorizado ? 'Priorização removida.' : 'Processo priorizado com sucesso.' });
    } catch (error) { setFeedback({ tipo: 'danger', msg: erroMsg(error, 'Não foi possível atualizar a priorização.') }); }
    finally { setOcupado(false); }
  };

  const selecionarProcesso = async (id) => {
    setProcessoId(id); setInstrumentos([]);
    if (!id) return;
    try { setInstrumentos(await instrumentoMonitoramentoService.listarPorProcesso(Number(id))); }
    catch (error) { setFeedback({ tipo: 'danger', msg: erroMsg(error, 'Não foi possível carregar os instrumentos.') }); }
  };

  const cadastrarInstrumento = async (event) => {
    event.preventDefault(); setOcupado(true); setFeedback({ tipo: '', msg: '' });
    try {
      await instrumentoMonitoramentoService.cadastrar({ processoId: Number(processoId), nome: form.nome, descricao: form.descricao });
      setInstrumentos(await instrumentoMonitoramentoService.listarPorProcesso(Number(processoId)));
      setForm({ nome: '', descricao: '' });
      setFeedback({ tipo: 'success', msg: 'Instrumento cadastrado com sucesso.' });
    } catch (error) { setFeedback({ tipo: 'danger', msg: erroMsg(error, 'Não foi possível cadastrar o instrumento.') }); }
    finally { setOcupado(false); }
  };

  const priorizados = processos.filter((p) => p.priorizado);

  return <div className="page">
    <header className="page-header"><div><div className="eyebrow">Módulos 1 e 3</div><h1 className="page-title">Preparar Plano de Governança</h1><p className="page-description">Priorize processos e cadastre os instrumentos necessários antes de montar a matriz.</p></div></header>
    {feedback.msg && <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>{feedback.msg}</div>}

    <section className="card card-pad" style={{ marginBottom: 18 }}>
      <h2 className="card-title">1. Priorizar processos</h2>
      <div style={{ overflowX: 'auto', marginTop: 14 }}><table className="table"><thead><tr><th>Processo</th><th>Status</th><th>Ação</th></tr></thead><tbody>
        {processos.length === 0 && <tr><td colSpan="3">Nenhum processo cadastrado.</td></tr>}
        {processos.map((p) => <tr key={p.id}><td>{p.nome}</td><td><span className={`badge ${p.priorizado ? 'badge-primary' : ''}`}>{p.priorizado ? 'Priorizado' : 'Não priorizado'}</span></td><td><button className={`btn ${p.priorizado ? 'btn-secondary' : 'btn-primary'}`} disabled={ocupado} onClick={() => alternarPriorizacao(p)}>{p.priorizado ? 'Remover priorização' : 'Priorizar'}</button></td></tr>)}
      </tbody></table></div>
    </section>

    <section className="card card-pad" style={{ marginBottom: 18 }}>
      <h2 className="card-title">2. Cadastrar instrumento do Módulo 3</h2>
      <form onSubmit={cadastrarInstrumento} style={{ marginTop: 14 }}>
        <div className="form-grid">
          <div className="field"><label className="label">Processo priorizado *</label><select className="select" value={processoId} onChange={(e) => selecionarProcesso(e.target.value)} required><option value="">Selecione</option>{priorizados.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
          <div className="field"><label className="label">Nome do instrumento *</label><input className="input" maxLength={160} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Dashboard gerencial" required /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label className="label">Descrição</label><textarea className="textarea" maxLength={500} rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={ocupado || !processoId}>Cadastrar instrumento</button>
      </form>
      {processoId && <div style={{ overflowX: 'auto', marginTop: 16 }}><table className="table"><thead><tr><th>Instrumentos ativos</th><th>Descrição</th></tr></thead><tbody>{instrumentos.length === 0 && <tr><td colSpan="2">Nenhum instrumento cadastrado.</td></tr>}{instrumentos.map((i) => <tr key={i.id}><td>{i.nome}</td><td>{i.descricao || '-'}</td></tr>)}</tbody></table></div>}
    </section>

    <Link to="/gestor/plano-governanca" className="btn btn-primary">Continuar para o Plano de Governança →</Link>
  </div>;
}
