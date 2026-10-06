/**
 * Fonte única dos rótulos dos 10 Princípios BPM exibidos no eixo do radar
 * (RadarMaturidade) e reutilizados no Relatório PDF (US18).
 *
 * Mantidos em um único lugar para garantir que a tela e o PDF exportado
 * nunca fiquem com rótulos ou ordenação divergentes (CA2 - US18).
 */

export const PRINCIPIOS_LABELS = {
  1: 'P1: Alinhamento Estratégico',
  2: 'P2: Foco no Cliente',
  3: 'P3: Agregação de Valor',
  4: 'P4: Orientação a Processos',
  5: 'P5: Liderança',
  6: 'P6: Cultura BPM',
  7: 'P7: Melhoria Contínua',
  8: 'P8: Inovação',
  9: 'P9: Tecnologia',
  10: 'P10: Governança',
};

export const ORDEM_PRINCIPIOS = Array.from({ length: 10 }, (_, i) => i + 1);
