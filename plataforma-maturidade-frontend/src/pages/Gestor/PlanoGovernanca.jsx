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

  const selecionarProcesso = async (processoId) => {
    const existente = planos.find((item) => String(item.processoId) === String(processoId));
    setForm(existente ? {
      processoId: String(existente.processoId),
      donoProcesso: existente.donoProcesso,
      instrumentoMonitoramentoId: String(existente.instrumentoMonitoramentoId),
      periodicidadeRevisao: existente.periodicidadeRevisao,
      gatilhosNovoCiclo: existente.gatilhosNovoCiclo,
    } : { ...FORM_INICIAL, processoId: String(processoId) });
    setInstrumentos([]); setHistorico([]); setFeedback({ tipo: '', msg: '' });
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

  const alterarCampo = (campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }));

  const salvar = async (event) => {
    event.preventDefault();
    setSalvando(true); setFeedback({ tipo: '', msg: '' });
    try {
      await planoGovernancaService.salvar({
        ...form, processoId: Number(form.processoId), instrumentoMonitoramentoId: Number(form.instrumentoMonitoramentoId),
      });
      setFeedback({ tipo: 'success', msg: planoSelecionado ? 'Nova versão do plano salva.' : 'Plano cadastrado com sucesso.' });
      await carregarDados();
      setHistorico(await planoGovernancaService.listarHistorico(Number(form.processoId)));
    } catch (error) {
      setFeedback({ tipo: 'danger', msg: 'Erro ao salvar o plano.' });
    } finally { setSalvando(false); }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Governança de processos</div>
          <h1 className="page-title">Tabela do Plano de Governança</h1>
        </div>
      </header>
      
      {feedback.msg && <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>{feedback.msg}</div>}
      
      <div className="actions-row" style={{ marginBottom: 18 }}>
        <Link className="btn btn-secondary" to="/gestor/configuracao-governanca">Priorizar processos</Link>
      </div>

      <section className="card card-pad" style={{ marginBottom: 18 }}>
        <h2 className="card-title">{planoSelecionado ? 'Editar plano vigente' : 'Cadastrar plano'}</h2>
        <form onSubmit={salvar} style={{ marginTop: 16 }}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Processo priorizado *</label>
              <select className="select" value={form.processoId} onChange={(e) => selecionarProcesso(e.target.value)} required>
                <option value="">Selecione um processo</option>
                {processos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Dono do processo *</label>
              <input className="input" value={form.donoProcesso} onChange={(e) => alterarCampo('donoProcesso', e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Instrumento de monitoramento *</label>
              <select className="select" value={form.instrumentoMonitoramentoId} onChange={(e) => alterarCampo('instrumentoMonitoramentoId', e.target.value)} disabled={!form.processoId || carregandoInstrumentos} required>
                <option value="">{carregandoInstrumentos ? 'Carregando...' : 'Selecione'}</option>
                {instrumentos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Periodicidade *</label>
              <select className="select" value={form.periodicidadeRevisao} onChange={(e) => alterarCampo('periodicidadeRevisao', e.target.value)} required>
                {PERIODICIDADES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Gatilhos para novo ciclo *</label>
              <textarea className="textarea" rows={3} value={form.gatilhosNovoCiclo} onChange={(e) => alterarCampo('gatilhosNovoCiclo', e.target.value)} required />
            </div>
          </div>
          <div className="actions-row" style={{ marginTop: 18 }}>
            <button className="btn btn-primary" type="submit" disabled={salvando || loading}>{salvando ? 'Salvando...' : 'Salvar plano'}</button>
          </div>
        </form>
      </section>

      <section className="card card-pad" style={{ marginBottom: 18 }}>
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
        <section className="card card-pad" style={{ marginBottom: 18 }}>
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
                <td><input type="text" className="input" placeholder="Opcional..." value={checklist.obsTabelaPreenchida} onChange={(e) => handleChecklistChange('obsTabelaPreenchida', e.target.value)} /></td>
              </tr>
              <tr>
                <td>2.</td>
                <td>Os Donos dos Processos concordaram com suas atribuições?</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checklist.donosConcordaram} onChange={(e) => handleChecklistChange('donosConcordaram', e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </td>
                <td><input type="text" className="input" placeholder="Opcional..." value={checklist.obsDonosConcordaram} onChange={(e) => handleChecklistChange('obsDonosConcordaram', e.target.value)} /></td>
              </tr>
              <tr>
                <td>3.</td>
                <td>O calendário de reuniões de monitoramento foi inserido na agenda da CRPA?</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checklist.calendarioInserido} onChange={(e) => handleChecklistChange('calendarioInserido', e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                </td>
                <td><input type="text" className="input" placeholder="Opcional..." value={checklist.obsCalendarioInserido} onChange={(e) => handleChecklistChange('obsCalendarioInserido', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {form.processoId && (
        <section className="card card-pad">
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