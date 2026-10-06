import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { alertaService } from '../../services/alertaService';

export const CalendarioAtividades = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

  // Controle do Mês/Ano exibido no Calendário
  const [dataAtual, setDataAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  // Data de "Hoje" zerada para comparação exata de vencimento (CA2)
  const hojeIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  // Carrega todos os alertas ativos de governança (CA2)
  const carregarAlertas = useCallback(async () => {
    try {
      setLoading(true);
      const dados = await alertaService.listarTodosAtivos();
      setAlertas(dados || []);
    } catch (err) {
      setFeedback({ tipo: 'danger', msg: 'Erro ao carregar os alertas do calendário.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAlertas();
  }, [carregarAlertas]);

  // Navegação de Meses
  const mesAnterior = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1));
    setDiaSelecionado(null);
  };

  const proximoMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1));
    setDiaSelecionado(null);
  };

  // Mapeamento dos Alertas por Data da Próxima Ocorrência (YYYY-MM-DD)
  const alertasPorData = useMemo(() => {
    const mapa = {};
    alertas.forEach((alerta) => {
      const dataChave = alerta.proximaOcorrencia || alerta.dataReferencia;
      if (dataChave) {
        if (!mapa[dataChave]) mapa[dataChave] = [];
        mapa[dataChave].push(alerta);
      }
    });
    return mapa;
  }, [alertas]);

  // Estruturação dos dias do Mês Atual
  const diasDoMes = useMemo(() => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const totalDiasMes = new Date(ano, mes + 1, 0).getDate();

    const matrizDias = [];

    // Células vazias para alinhar com o dia da semana
    for (let i = 0; i < primeiroDiaSemana; i++) {
      matrizDias.push(null);
    }

    // Dias reais do mês
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const mesFormatado = String(mes + 1).padStart(2, '0');
      const diaFormatado = String(dia).padStart(2, '0');
      const isoDate = `${ano}-${mesFormatado}-${diaFormatado}`;

      const listaAlertas = alertasPorData[isoDate] || [];
      const possuiVencidos = listaAlertas.some((a) => (a.proximaOcorrencia || a.dataReferencia) < hojeIso);

      matrizDias.push({
        numero: dia,
        isoDate,
        alertas: listaAlertas,
        possuiVencidos,
      });
    }

    return matrizDias;
  }, [dataAtual, alertasPorData, hojeIso]);

  const nomeMesAno = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="badge badge-primary">Governançade Processos</span>
          <h1 className="page-title" style={{ marginTop: '8px' }}>Calendário de Atividades </h1>
          <p className="page-description">
            Acompanhe prazos, revisões programadas e pendências ativas dos processos.
          </p>
        </div>
      </header>

      {feedback.msg && (
        <div className={`alert alert-${feedback.tipo}`} style={{ marginBottom: 16 }}>
          {feedback.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* LADO ESQUERDO: GRADE DO CALENDÁRIO MENSAL */}
        <article className="card card-pad" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="card-title" style={{ textTransform: 'capitalize' }}>{nomeMesAno}</h2>
            <div>
              <button type="button" className="btn btn-secondary" onClick={mesAnterior} style={{ marginRight: '8px' }}>
                ← Mês Anterior
              </button>
              <button type="button" className="btn btn-secondary" onClick={proximoMes}>
                Próximo Mês →
              </button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' }}>
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          {/* Grade de Dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {diasDoMes.map((item, idx) => {
              if (!item) {
                return <div key={`vazio-${idx}`} style={{ minHeight: '80px', background: '#f8fafc', borderRadius: '6px' }} />;
              }

              const temAlertas = item.alertas.length > 0;
              const isHoje = item.isoDate === hojeIso;
              const isSelecionado = diaSelecionado?.isoDate === item.isoDate;

              return (
                <div
                  key={item.isoDate}
                  onClick={() => temAlertas && setDiaSelecionado(item)}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: isSelecionado ? '2px solid #2563eb' : isHoje ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: temAlertas ? (item.possuiVencidos ? '#fef2f2' : '#f0fdf4') : '#ffffff',
                    cursor: temAlertas ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: isHoje ? 'bold' : 'normal' }}>
                    <span>{item.numero}</span>
                    {isHoje && <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Hoje</span>}
                  </div>

                  {/* CA1 & CA2: Marcações de Atividades */}
                  {temAlertas && (
                    <div style={{ marginTop: '6px' }}>
                      <span
                        className={`badge ${item.possuiVencidos ? 'badge-danger' : 'badge-success'}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          display: 'block',
                          textAlign: 'center',
                          background: item.possuiVencidos ? '#ef4444' : '#10b981',
                          color: '#ffffff',
                        }}
                      >
                        {item.alertas.length} {item.alertas.length === 1 ? 'alerta' : 'alertas'}
                        {item.possuiVencidos && ' ⚠️'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        {/* LADO DIREITO: DETALHAMENTO DO DIA SELECIONADO (CA1) */}
        <article className="card card-pad" style={{ padding: '20px' }}>
          <h2 className="card-title">Detalhes das Atividades</h2>
          {!diaSelecionado ? (
            <p className="card-description" style={{ marginTop: '12px' }}>
              Clique em uma data marcada no calendário para visualizar os alertas de acompanhamento e revisões vinculadas.
            </p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', pb: '8px' }}>
                <strong>Data: {diaSelecionado.isoDate.split('-').reverse().join('/')}</strong>
                <p className="card-description">{diaSelecionado.alertas.length} atividade(s) encontrada(s)</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {diaSelecionado.alertas.map((alerta) => {
                  const isVencido = (alerta.proximaOcorrencia || alerta.dataReferencia) < hojeIso;

                  return (
                    <div
                      key={alerta.id}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${isVencido ? '#ef4444' : '#10b981'}`,
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{alerta.titulo}</strong>
                        {isVencido && (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                            VENCIDO
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#2563eb', margin: '4px 0' }}>
                        Processo: {alerta.processoNome}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>
                        <strong>Gatilho:</strong> {alerta.gatilho}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                        Periodicidade: {alerta.periodicidade}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};