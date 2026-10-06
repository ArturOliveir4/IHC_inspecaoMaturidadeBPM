/**
 * Funções de formatação compartilhadas.
 *
 * IMPORTANTE (US18 - CA2): estas funções são a fonte única de formatação de
 * percentuais, datas e valores de KPI usada tanto pelas telas (Dashboard
 * Gerencial, Comparativo de KPIs) quanto pelo gerador de Relatório PDF.
 * Isso garante que o valor exportado no PDF seja sempre idêntico ao exibido
 * na interface, sem divergência de arredondamento.
 */

export const formatarPercentual = (valor) => {
  if (valor === null || valor === undefined) return '-';
  return `${Number(valor).toFixed(1)}%`;
};

export const formatarData = (valor) => {
  if (!valor) return '-';
  return new Date(valor).toLocaleString('pt-BR');
};

export const formatarValorKpi = (valor, unidade) => {
  if (valor === null || valor === undefined) return '-';
  if (unidade === 'R$') return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
  return `${Number(valor)} ${unidade === 'Pontos' ? '' : (unidade || '')}`.trim();
};

export const formatarDelta = (delta) => {
  if (delta === null || delta === undefined) return '-';
  const numero = Number(delta);
  return `${numero > 0 ? '+' : ''}${numero}%`;
};
