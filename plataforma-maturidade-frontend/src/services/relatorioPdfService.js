import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarData } from '../utils/formatters';

/**
 * US18 — Gerar Relatório em PDF
 *
 * Geração 100% client-side (sem chamada adicional ao backend), o que garante
 * o prazo de até 5 segundos exigido pelo CA3: o gráfico radar já está
 * renderizado em tela (Chart.js) e é apenas convertido para imagem: não há
 * espera de rede além dos dados que a própria tela já carregou.
 *
 * Nome institucional exibido no cabeçalho do PDF (CA1). Como o projeto ainda
 * não possui uma entidade de "Organização" configurável, usa-se a mesma
 * identificação institucional já exibida na barra lateral da aplicação
 * (AppLayout: "Maturidade BPM" / "CRPA / PROGRAD").
 */
export const NOME_ORGANIZACAO = 'CRPA / PROGRAD — Universidade Estadual da Paraíba (UEPB)';

const COR_PRIMARIA = [31, 41, 55]; // cinza escuro formal: #1f2937
const COR_TEXTO = [17, 24, 39]; // var(--text): #111827
const COR_MUTED = [107, 114, 128]; // var(--muted): #6b7280
const MARGEM = 40;

const novaPagina = (doc, cursorY, alturaNecessaria, margemInferior = 60) => {
  const alturaPagina = doc.internal.pageSize.getHeight();
  if (cursorY + alturaNecessaria > alturaPagina - margemInferior) {
    doc.addPage();
    return MARGEM;
  }
  return cursorY;
};

const desenharCabecalho = (doc, { dataAvaliacao, nomeAvaliador }) => {
  const larguraPagina = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(0, 0, larguraPagina, 76, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Relatório de Avaliação de Maturidade em Processos (BPM)', MARGEM, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(NOME_ORGANIZACAO, MARGEM, 48);

  doc.setFontSize(9.5);
  doc.text(`Data da avaliação: ${formatarData(dataAvaliacao)}`, MARGEM, 64);
  doc.text(`Avaliador responsável: ${nomeAvaliador || 'Não informado'}`, larguraPagina / 2 + 10, 64);

  doc.setTextColor(...COR_TEXTO);
  return 96;
};

const desenharRodape = (doc) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();

  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(...COR_MUTED);
    doc.text(
      `Gerado em ${formatarData(new Date())} — Plataforma de Maturidade BPM`,
      MARGEM,
      alturaPagina - 24
    );
    doc.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - MARGEM, alturaPagina - 24, {
      align: 'right',
    });
  }
};

/**
 * Gera e baixa automaticamente (CA3) o PDF do relatório de maturidade.
 *
 * @param {Object} params
 * @param {string|Date} params.dataAvaliacao - Data da avaliação (CA1).
 * @param {string} params.nomeAvaliador - Nome/identificação do avaliador (CA1).
 * @param {string} params.percentualGeral - Percentual geral já formatado como
 *   exibido em tela (ex.: "78.5%") (CA1).
 * @param {Array<{label: string, percentual: string}>} params.principios -
 *   Resultados percentuais por princípio, já formatados como em tela (CA1).
 * @param {string|null} params.radarImagemBase64 - PNG base64 do gráfico
 *   radar (obtido via chart.toBase64Image()) (CA1).
 * @param {number} [params.radarImagemLargura] - Largura real (px) do canvas
 *   capturado. Usada para preservar a proporção exata da imagem no PDF e
 *   evitar distorção/achatamento.
 * @param {number} [params.radarImagemAltura] - Altura real (px) do canvas
 *   capturado (ver radarImagemLargura).
 * @param {{processoNome?: string, itens: Array<{nome:string, asIs:string, toBe:string, delta:string}>}|null} params.comparativoKpis -
 *   Tabela AS-IS vs TO-BE com deltas, quando disponível (CA2). Pode ser null.
 * @param {string} [params.nomeArquivo] - Nome do arquivo baixado.
 */
export function gerarRelatorioMaturidadePdf({
  dataAvaliacao,
  nomeAvaliador,
  percentualGeral,
  principios = [],
  radarImagemBase64 = null,
  radarImagemLargura = null,
  radarImagemAltura = null,
  comparativoKpis = null,
  nomeArquivo = 'relatorio-maturidade-bpm.pdf',
} = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const larguraUtil = doc.internal.pageSize.getWidth() - MARGEM * 2;

  let cursorY = desenharCabecalho(doc, { dataAvaliacao, nomeAvaliador });

  // Percentual geral de maturidade em destaque (CA1)
  if (percentualGeral !== null && percentualGeral !== undefined) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COR_TEXTO);
    doc.text('Percentual geral de maturidade:', MARGEM, cursorY);
    doc.setTextColor(...COR_PRIMARIA);
    doc.text(String(percentualGeral), MARGEM + 210, cursorY);
    doc.setTextColor(...COR_TEXTO);
    cursorY += 22;
  }

  // Gráfico radar (CA1)
  if (radarImagemBase64) {
    // Preserva a proporção real do canvas capturado (evita achatar/esticar o
    // gráfico). Se as dimensões reais não forem informadas, assume-se 1:1
    // como fallback seguro (o próprio Chart.js já é forçado a renderizar
    // quadrado — ver RadarMaturidade.jsx).
    const proporcao = radarImagemLargura && radarImagemAltura
      ? radarImagemLargura / radarImagemAltura
      : 1;
    const tamanhoMaximo = 260;
    let imgWidth = tamanhoMaximo;
    let imgHeight = tamanhoMaximo / proporcao;
    if (imgHeight > tamanhoMaximo) {
      imgHeight = tamanhoMaximo;
      imgWidth = tamanhoMaximo * proporcao;
    }

    cursorY = novaPagina(doc, cursorY, imgHeight + 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('Gráfico radar — maturidade por princípio', MARGEM, cursorY);
    cursorY += 10;
    const posX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
    doc.addImage(radarImagemBase64, 'PNG', posX, cursorY, imgWidth, imgHeight);
    cursorY += imgHeight + 20;
  }

  // Tabela de resultados percentuais por princípio (CA1)
  if (Array.isArray(principios) && principios.length > 0) {
    cursorY = novaPagina(doc, cursorY, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('Resultados percentuais por princípio', MARGEM, cursorY);
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGEM, right: MARGEM },
      tableWidth: larguraUtil,
      head: [['Princípio BPM', 'Percentual de maturidade']],
      body: principios.map((p) => [p.label, p.percentual]),
      styles: { fontSize: 9, textColor: COR_TEXTO, cellPadding: 6 },
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [246, 247, 251] },
    });

    cursorY = doc.lastAutoTable.finalY + 26;
  }

  // Tabela comparativa AS-IS vs TO-BE, quando disponível (CA2)
  if (comparativoKpis && Array.isArray(comparativoKpis.itens) && comparativoKpis.itens.length > 0) {
    cursorY = novaPagina(doc, cursorY, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    const titulo = comparativoKpis.processoNome
      ? `Comparativo AS-IS vs TO-BE — ${comparativoKpis.processoNome}`
      : 'Comparativo AS-IS vs TO-BE';
    doc.text(titulo, MARGEM, cursorY);
    cursorY += 8;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGEM, right: MARGEM },
      tableWidth: larguraUtil,
      head: [['Indicador (KPI)', 'AS-IS', 'TO-BE', 'Delta (%)']],
      body: comparativoKpis.itens.map((item) => [item.nome, item.asIs, item.toBe, item.delta]),
      styles: { fontSize: 9, textColor: COR_TEXTO, cellPadding: 6 },
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [246, 247, 251] },
    });
  }

  desenharRodape(doc);

  // Download automático (CA3) — sem etapas intermediárias de confirmação.
  doc.save(nomeArquivo);
}

export const nomeArquivoRelatorio = (prefixo = 'relatorio-maturidade-bpm') => {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10);
  const hora = `${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
  return `${prefixo}-${data}-${hora}.pdf`;
};
