// src/components/ProgressBar.jsx
import React from 'react';

/**
 * Barra de progresso visual para o formulário multi-step.
 * Props:
 *  - etapaAtual: índice base-1 (1 a totalEtapas)
 *  - totalEtapas: número total de etapas (10 princípios)
 *  - percentualRespondido: % de questões respondidas (0 a 100)
 */
const ProgressBar = ({ etapaAtual, totalEtapas, percentualRespondido }) => {
  const styles = {
    wrapper: {
      marginBottom: '24px',
    },
    topo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    textoEtapa: {
      fontSize: '13px',
      color: '#4a5568',
      fontWeight: '600',
    },
    textoPercentual: {
      fontSize: '13px',
      color: '#718096',
    },
    trilha: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    preenchimento: {
      height: '100%',
      width: `${percentualRespondido}%`,
      backgroundColor: percentualRespondido === 100 ? '#38a169' : '#2b6cb0',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    indicadoresEtapas: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '6px',
    },
    bolinha: (ativa, concluida) => ({
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: concluida ? '#38a169' : ativa ? '#2b6cb0' : '#e2e8f0',
      color: concluida || ativa ? '#ffffff' : '#a0aec0',
      fontSize: '11px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s',
      flexShrink: 0,
    }),
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.topo}>
        <span style={styles.textoEtapa}>
          Princípio {etapaAtual} de {totalEtapas}
        </span>
        <span style={styles.textoPercentual}>
          {Math.round(percentualRespondido)}% respondido
        </span>
      </div>

      <div style={styles.trilha} role="progressbar" aria-valuenow={percentualRespondido} aria-valuemin={0} aria-valuemax={100}>
        <div style={styles.preenchimento} />
      </div>

      <div style={styles.indicadoresEtapas}>
        {Array.from({ length: totalEtapas }, (_, i) => {
          const numEtapa = i + 1;
          const ativa = numEtapa === etapaAtual;
          const concluida = numEtapa < etapaAtual;
          return (
            <div key={numEtapa} style={styles.bolinha(ativa, concluida)} title={`Princípio ${numEtapa}`}>
              {concluida ? '✓' : numEtapa}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
