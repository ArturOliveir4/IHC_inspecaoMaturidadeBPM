import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { acionamentoGatilhoService } from '../../services/acionamentoGatilhoService';
import { planoGovernancaService } from '../../services/planoGovernancaService';

export const AcionarGatilho = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ gatilho: '', justificativa: '', dataAcionamento: new Date().toISOString().split('T')[0] });
  const [gatilhosOpcoes, setGatilhosOpcoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const planos = await planoGovernancaService.listarVigentes();
        const plano = planos.find(p => String(p.processoId) === String(id));
        if (plano) setGatilhosOpcoes(plano.gatilhosNovoCiclo);
      } catch (error) {
        console.error(error);
      }
    };
    carregarOpcoes();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await acionamentoGatilhoService.acionar(id, form);
      setFeedback({ tipo: 'success', msg: 'Gatilho acionado com sucesso. Um novo ciclo de maturidade (Módulo 1) foi iniciado.' });
      setTimeout(() => navigate('/diagnostico'), 2500);
    } catch (error) {
      setFeedback({ tipo: 'danger', msg: error.response?.data?.message || 'Erro ao acionar gatilho.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Governança de Processos</div>
          <h1 className="page-title">Acionar Gatilho (Novo Ciclo)</h1>
          <p className="page-description">Registre a ativação de um gatilho para reabrir automaticamente a análise AS-IS (Módulo 1) mantendo a linha do tempo intacta.</p>
        </div>
      </header>
      {feedback.msg && <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>{feedback.msg}</div>}
      <section className="card card-pad">
        <h2 className="card-title">Detalhes do Acionamento</h2>
        {gatilhosOpcoes && <p style={{ marginBottom: 16, color: 'var(--muted-strong)', fontSize: '14px' }}><strong>Gatilhos vinculados a este processo:</strong> {gatilhosOpcoes}</p>}
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Qual gatilho ocorreu? *</label>
              <input className="input" value={form.gatilho} onChange={e => setForm({...form, gatilho: e.target.value})} placeholder="Ex: Mudança Normativa PROGRAD" required />
            </div>
            <div className="field">
              <label className="label">Data de Acionamento *</label>
              <input type="date" className="input" value={form.dataAcionamento} onChange={e => setForm({...form, dataAcionamento: e.target.value})} required />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Justificativa Detalhada *</label>
              <textarea className="textarea" rows={4} value={form.justificativa} onChange={e => setForm({...form, justificativa: e.target.value})} placeholder="Descreva o impacto no contexto atual" required />
            </div>
          </div>
          <div className="actions-row" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Acionando...' : 'Confirmar e Iniciar Novo Ciclo'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/gestor/plano-governanca')} disabled={loading}>Cancelar</button>
          </div>
        </form>
      </section>
    </div>
  );
};