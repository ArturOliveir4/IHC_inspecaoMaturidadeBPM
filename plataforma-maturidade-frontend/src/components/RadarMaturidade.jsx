import React, { forwardRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { PRINCIPIOS_LABELS, ORDEM_PRINCIPIOS } from '../constants/principiosLabels';

// Registro dos módulos do Chart.js necessários para o Gráfico Radar.
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// forwardRef expõe a instância interna do Chart.js (via react-chartjs-2) para
// que outras partes da aplicação (ex.: exportação de PDF na US18) possam
// capturar o gráfico renderizado como imagem com chartRef.current.toBase64Image().
export const RadarMaturidade = forwardRef(({ dadosPrincipios }, ref) => {
  // Mapeia os 10 princípios BPM na ordem correta dos eixos.
  const labels = ORDEM_PRINCIPIOS.map((numero) => PRINCIPIOS_LABELS[numero]);

  // Extrai os valores numéricos exatos (CA3) respeitando a ordem de 1 a 10.
  const dataValues = ORDEM_PRINCIPIOS.map((numero) => dadosPrincipios?.[numero] || 0);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Maturidade Atual (AS-IS)',
        data: dataValues,
        backgroundColor: 'rgba(170, 59, 255, 0.2)',
        borderColor: 'rgba(170, 59, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(170, 59, 255, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    // maintainAspectRatio + aspectRatio: 1 garantem que o canvas seja sempre
    // renderizado como um quadrado perfeito, independentemente da largura do
    // container. Antes, com maintainAspectRatio: false, o canvas assumia as
    // proporções (retangulares) do container e, ao ser capturado como imagem
    // para o Relatório PDF (US18) e encaixado num quadro quadrado, o gráfico
    // saía distorcido/achatado.
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
  };

  // Garante a responsividade (CA2) e a renderização sem recarregar a página (CA1).
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Radar ref={ref} data={data} options={options} />
    </div>
  );
});

RadarMaturidade.displayName = 'RadarMaturidade';
