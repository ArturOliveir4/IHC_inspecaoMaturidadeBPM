export const MOCK_PROFILES = {
  gestor: { email: 'gestor@uepb.edu.br', perfil: 'ROLE_GESTOR', nome: 'Gestor BPM', setor: 'CRPA / PROGRAD' },
  avaliador: { email: 'avaliador@uepb.edu.br', perfil: 'ROLE_AVALIADOR', nome: 'Avaliador CRPA', setor: 'Coordenação de Processos' },
  analista: { email: 'analista@uepb.edu.br', perfil: 'ROLE_ANALISTA', nome: 'Analista BPM', setor: 'Escritório de Processos' },
};

export const MOCK_RESPOSTAS = Array.from({ length: 10 }).reduce((acc, _, index) => {
  const principio = index + 1;
  acc[`P${principio}_Q1`] = principio % 2 === 0 ? 4 : 5;
  acc[`P${principio}_Q2`] = principio % 3 === 0 ? 3 : 4;
  return acc;
}, {});

export const MOCK_AVALIACAO_ATIVA = {
  id: 1042,
  status: 'EM_ANDAMENTO',
  etapaAtual: 1,
  respostas: MOCK_RESPOSTAS,
};

export const MOCK_RESULTADO = {
  percentualGeral: 78.5,
  totalRespondidas: 20,
  resultadosPorPrincipio: { 1: 86, 2: 80, 3: 74, 4: 78, 5: 88, 6: 70, 7: 82, 8: 72, 9: 84, 10: 71 },
};

export const MOCK_HISTORICO = [
  { id: 1042, data: '2026-06-28T14:30:00', emailAvaliador: 'avaliador@uepb.edu.br', nomeAvaliador: 'Avaliador CRPA', status: 'CONCLUIDA', percentualGeral: 78.5 },
  { id: 1039, data: '2026-06-20T10:15:00', emailAvaliador: 'gestor@uepb.edu.br', nomeAvaliador: 'Gestor BPM', status: 'CONCLUIDA', percentualGeral: 71.2 },
  { id: 1035, data: '2026-06-12T09:05:00', emailAvaliador: 'analista@uepb.edu.br', nomeAvaliador: 'Analista BPM', status: 'EM_ANDAMENTO', percentualGeral: 52.0 },
];

export const MOCK_DETALHES_AVALIACAO = {
  1042: {
    id: 1042,
    data: '2026-06-28T14:30:00',
    emailAvaliador: 'avaliador@uepb.edu.br',
    nomeAvaliador: 'Avaliador CRPA',
    status: 'CONCLUIDA',
    percentualGeral: 78.5,
    percentuaisPorPrincipio: MOCK_RESULTADO.resultadosPorPrincipio,
    respostas: [
      { principio: 'Alinhamento estratégico', questao: 'Objetivos BPM alinhados ao planejamento institucional', nota: 5 },
      { principio: 'Foco no cidadão', questao: 'Necessidades dos usuários consideradas no desenho dos processos', nota: 4 },
      { principio: 'Governança', questao: 'Papéis e responsabilidades definidos para evolução BPM', nota: 4 },
    ],
  },
  1039: {
    id: 1039,
    data: '2026-06-20T10:15:00',
    emailAvaliador: 'gestor@uepb.edu.br',
    nomeAvaliador: 'Gestor BPM',
    status: 'CONCLUIDA',
    percentualGeral: 71.2,
    percentuaisPorPrincipio: { 1: 78, 2: 76, 3: 68, 4: 70, 5: 74, 6: 64, 7: 72, 8: 66, 9: 75, 10: 69 },
    respostas: [
      { principio: 'Processos', questao: 'Processos críticos mapeados e documentados', nota: 4 },
      { principio: 'Tecnologia', questao: 'Ferramentas digitais apoiam acompanhamento dos indicadores', nota: 4 },
    ],
  },
  1035: {
    id: 1035,
    data: '2026-06-12T09:05:00',
    emailAvaliador: 'analista@uepb.edu.br',
    nomeAvaliador: 'Analista BPM',
    status: 'EM_ANDAMENTO',
    percentualGeral: 52.0,
    percentuaisPorPrincipio: { 1: 60, 2: 55, 3: 48, 4: 58, 5: 62, 6: 40, 7: 52, 8: 44, 9: 56, 10: 45 },
    respostas: [
      { principio: 'Cultura BPM', questao: 'Equipe reconhece valor da gestão por processos', nota: 3 },
      { principio: 'Melhoria contínua', questao: 'Há rotina de revisão dos fluxos existentes', nota: 3 },
    ],
  },
};

export const MOCK_AS_IS = {
  kpi: { id: 501, processoId: 1, processoNome: 'Solicitação de Aproveitamento de Estudos', cicloAvaliacaoId: 1, tmc: 12, unidadeTmc: 'DIAS', tr: 8, ns: 4, criadoPor: 'analista@uepb.edu.br', atualizadoPor: 'analista@uepb.edu.br' },
  diagrama: { nome: 'as-is-aproveitamento-estudos.pdf', formato: 'PDF', tamanhoBytes: 248000, enviadoEm: '2026-06-26T15:30:00', enviadoPor: 'analista@uepb.edu.br' },
};

export const MOCK_USUARIOS_LISTA = Object.values(MOCK_PROFILES).map((dados) => ({
  email: dados.email,
  nome: dados.nome,
  perfil: dados.perfil,
  setor: dados.setor,
  status: dados.perfil === 'ROLE_ANALISTA' ? 'Pendente' : 'Ativo',
}));
