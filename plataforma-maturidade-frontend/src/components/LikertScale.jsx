import React from 'react';

const LABELS = {
  1: 'Discordo totalmente',
  2: 'Discordo',
  3: 'Neutro',
  4: 'Concordo',
  5: 'Concordo totalmente',
};

const LikertScale = ({ value, onChange, disabled = false }) => {
  return (
    <div style={styles.wrapper} role="group" aria-label="Escala de concordância de 1 a 5">
      <div style={styles.options}>
        {[1, 2, 3, 4, 5].map((nota) => {
          const selecionado = value === nota;
          return (
            <button
              key={nota}
              type="button"
              style={styles.option(selecionado)}
              onClick={() => !disabled && onChange(nota)}
              aria-pressed={selecionado}
              aria-label={`${nota} - ${LABELS[nota]}`}
              title={LABELS[nota]}
              disabled={disabled}
            >
              <span style={styles.number}>{nota}</span>
              <span style={styles.label}>{LABELS[nota]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
  },
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 8,
  },
  option: (selected) => ({
    minHeight: 76,
    padding: '10px 8px',
    borderRadius: 14,
    border: selected ? '1px solid var(--primary)' : '1px solid var(--border)',
    background: selected ? 'var(--primary-soft)' : '#ffffff',
    color: selected ? 'var(--primary-dark)' : 'var(--muted-strong)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.18s ease',
    boxShadow: selected ? '0 0 0 4px rgba(29, 78, 216, 0.08)' : 'none',
  }),
  number: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontWeight: 850,
    background: 'rgba(255,255,255,0.75)',
  },
  label: {
    fontSize: 11,
    lineHeight: 1.2,
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default LikertScale;
