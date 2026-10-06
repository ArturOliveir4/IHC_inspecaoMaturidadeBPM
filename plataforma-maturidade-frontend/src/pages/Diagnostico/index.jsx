import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAvaliacao from '../../hooks/useAvaliacao';
import LikertScale from '../../components/LikertScale';
import ProgressBar from '../../components/ProgressBar';
import { PRINCIPIOS_BPM } from './principiosBpm';

export const Diagnostico = () => {
  const navigate = useNavigate();
  const {
    avaliacaoId,
    etapaAtual,
    carregando,
    salvando,
    erro,
    finalizado,
    totalRespondidas,
    registrarResposta,
    avancarEtapa,
    voltarEtapa,
    reabrirQuestionario,
    finalizarAvaliacao,
    getNota,
    principioCompleto,
  } = useAvaliacao();

  const principioAtual = PRINCIPIOS_BPM[etapaAtual - 1] || PRINCIPIOS_BPM[0];
  const isUltimaEtapa = etapaAtual === PRINCIPIOS_BPM.length;
  const etapaAtualCompleta = principioCompleto(principioAtual?.numero);
  const percentualRespondido = (totalRespondidas / 20) * 100;

  const handleFinalizar = useCallback(async () => {
    const result = await finalizarAvaliacao();
    if (result.sucesso) {
      navigate(`/gestor/resultados/${avaliacaoId}`);
    }
  }, [avaliacaoId, finalizarAvaliacao, navigate]);

  const handleNotaChange = useCallback((numeroQuestao, nota) => {
    if (!principioAtual) return;
    registrarResposta(principioAtual.numero, numeroQuestao, Number(nota));
  }, [principioAtual, registrarResposta]);

  if (carregando) {
    return <div className="page"><div className="card card-pad empty-state">Carregando questionário...</div></div>;
  }

  //  TELA DE CONCLUÍDO COM OS DOIS BOTÕES
  if (finalizado) {
    return (
      <div className="page">
        <section className="card card-pad" style={{ textAlign: 'center', maxWidth: 620, margin: '40px auto' }}>
          <span className="badge badge-success">Concluído</span>
          <h1 className="page-title" style={{ marginTop: 14 }}>Avaliação concluída</h1>
          <p className="page-description" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Todas as {totalRespondidas} questões foram respondidas e salvas com sucesso.
          </p>
          <div className="actions-row" style={{ justifyContent: 'center', gap: 12, marginTop: 20 }}>
            <button 
              type="button" 
              onClick={() => navigate(`/gestor/resultados/${avaliacaoId}`)} 
              className="btn btn-primary"
            >
              Ver gráfico de resultados
            </button>

            <button 
              type="button" 
              onClick={reabrirQuestionario} 
              className="btn btn-secondary"
            >
              Refazer / Editar Respostas
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Diagnóstico BPM</div>
          <h1 className="page-title">Questionário de maturidade</h1>
          <p className="page-description">
            Suas respostas são salvas automaticamente a cada clique.
          </p>
        </div>
        <span className="badge badge-warning">Em andamento</span>
      </header>

      <section className="card card-pad" style={{ marginBottom: 16 }}>
        <ProgressBar etapaAtual={etapaAtual} totalEtapas={PRINCIPIOS_BPM.length} percentualRespondido={percentualRespondido} />
      </section>

      <section className="card card-pad">
        <div className="actions-row" style={{ alignItems: 'flex-start', marginBottom: 18 }}>
          <div className="brand-mark" style={{ width: 52, height: 52 }}>P{principioAtual.numero}</div>
          <div>
            <h2 className="card-title">{principioAtual.titulo}</h2>
            <p className="card-description">{principioAtual.descricao}</p>
          </div>
        </div>

        <div className="grid" style={{ gap: 18 }}>
          {principioAtual.questoes.map((questao) => (
            <article key={`${principioAtual.numero}-${questao.numero}`} className="card" style={{ padding: 18, background: 'var(--surface-soft)' }}>
              <div className="actions-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ color: 'var(--text)', lineHeight: 1.6, fontWeight: 650 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 850 }}>{principioAtual.numero}.{questao.numero}</span> - {questao.texto}
                </p>
                {getNota(principioAtual.numero, questao.numero) && <span className="badge badge-success">Respondida</span>}
              </div>

              <LikertScale value={getNota(principioAtual.numero, questao.numero)} onChange={(nota) => handleNotaChange(questao.numero, nota)} disabled={salvando} />
            </article>
          ))}
        </div>

        {erro && <div className="alert alert-danger" style={{ marginTop: 18 }}>{erro}</div>}

        <div className="actions-row" style={{ justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={voltarEtapa} disabled={etapaAtual === 1 || salvando}>Anterior</button>
          <span className="badge badge-primary">{salvando ? 'Salvando...' : `${totalRespondidas} / 20 respondidas`}</span>
          {isUltimaEtapa ? (
            <button type="button" className="btn btn-primary" onClick={handleFinalizar} disabled={!etapaAtualCompleta || salvando}>{salvando ? 'Atualizar e Concluir' : 'Concluir avaliação'}</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={avancarEtapa} disabled={!etapaAtualCompleta || salvando}>{salvando ? 'Salvando...' : 'Próximo'}</button>
          )}
        </div>
      </section>
    </div>
  );
};