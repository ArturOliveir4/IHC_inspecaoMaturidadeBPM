/**
 * Definição estática dos 10 Princípios BPM com suas 2 questões cada.
 * Estes dados são a fonte de verdade para renderizar o formulário de diagnóstico.
 * Total: 20 variáveis do tipo Inteiro (escala 1-5).
 */

export const PRINCIPIOS_BPM = [
  {
    numero: 1,
    titulo: 'Princípio do Propósito (Nosso Objetivo)',
    questoes: [
      {
        numero: 1,
        texto: 'Os processos que executamos na CRPA estão claramente alinhados com os objetivos estratégicos da PROGRAD e da UEPB.',
      },
      {
        numero: 2,
        texto: 'Eu compreendo como minhas atividades diárias contribuem para o resultado final dos serviços da CRPA (ex: registro de diplomas).',
      },
    ],
  },
  {
    numero: 2,
    titulo: 'Adaptação à Realidade (Nosso Contexto)',
    questoes: [
      {
        numero: 1,
        texto: 'Nossos processos de trabalho são adequados à cultura e ao modo como a UEPB funciona.',
      },
      {
        numero: 2,
        texto: 'Ao desenhar ou melhorar um processo, levamos em conta as limitações e os recursos disponíveis em nossa realidade.',
      },
    ],
  },
  {
    numero: 3,
    titulo: 'Padronização Oficial (Tornar Regra)',
    questoes: [
      {
        numero: 1,
        texto: 'Existe um responsável ou uma rotina clara para monitorar e melhorar continuamente nossos processos de trabalho.',
      },
      {
        numero: 2,
        texto: 'Quando um processo é melhorado, essa nova forma de trabalhar é documentada e se torna o novo padrão oficial para todos.',
      },
    ],
  },
  {
    numero: 4,
    titulo: 'Envolvimento da Equipe (Participação)',
    questoes: [
      {
        numero: 1,
        texto: 'A equipe da CRPA é frequentemente consultada e envolvida ativamente nas discussões para melhorar nossos processos.',
      },
      {
        numero: 2,
        texto: 'A gestão incentiva que todos proponham soluções para os problemas e gargalos que encontramos no dia a dia.',
      },
    ],
  },
  {
    numero: 5,
    titulo: 'Consenso da Equipe (Entendimento Comum)',
    questoes: [
      {
        numero: 1,
        texto: 'Os termos, mapas e documentos que descrevem nossos processos são fáceis de entender por qualquer membro da equipe.',
      },
      {
        numero: 2,
        texto: 'Existe um consenso claro entre todos na CRPA sobre como nossos principais processos devem funcionar.',
      },
    ],
  },
  {
    numero: 6,
    titulo: 'Visão do Todo (Impacto nos Outros Setores)',
    questoes: [
      {
        numero: 1,
        texto: 'Ao melhorar uma tarefa em nosso setor, consideramos o impacto que a mudança terá em outras áreas da PROGRAD.',
      },
      {
        numero: 2,
        texto: 'As melhorias que fazemos consideram o fluxo de trabalho de ponta a ponta, incluindo a interação com outros setores.',
      },
    ],
  },
  {
    numero: 7,
    titulo: 'Princípio da Capacitação (Desenvolvimento da Equipe)',
    questoes: [
      {
        numero: 1,
        texto: 'Nossas ações para melhorar processos visam nos capacitar para desafios futuros, e não apenas resolver problemas urgentes.',
      },
      {
        numero: 2,
        texto: 'A forma como gerenciamos os processos nos ajuda a desenvolver novas habilidades e competências como equipe.',
      },
    ],
  },
  {
    numero: 8,
    titulo: 'Princípio da Simplicidade (Menos Burocracia)',
    questoes: [
      {
        numero: 1,
        texto: 'Nossos processos de trabalho são diretos e fáceis de executar, sem burocracia ou etapas desnecessárias.',
      },
      {
        numero: 2,
        texto: 'Buscamos ativamente maneiras de simplificar os fluxos de trabalho e eliminar a complexidade.',
      },
    ],
  },
  {
    numero: 9,
    titulo: 'Uso da Tecnologia (Sistemas de Apoio)',
    questoes: [
      {
        numero: 1,
        texto: 'As ferramentas e sistemas que utilizamos (ex: SUAP, e-mail) realmente nos ajudam a executar os processos de forma mais eficiente.',
      },
      {
        numero: 2,
        texto: 'A tecnologia é bem utilizada para automatizar tarefas repetitivas e dar suporte ao nosso trabalho na CRPA.',
      },
    ],
  },
  {
    numero: 10,
    titulo: 'Princípio da Continuidade (Melhoria Constante)',
    questoes: [
      {
        numero: 1,
        texto: 'A melhoria de processos é vista como um esforço contínuo e permanente na CRPA, e não como um projeto com início, meio e fim.',
      },
      {
        numero: 2,
        texto: 'Existe um ciclo regular de revisão e aprimoramento dos nossos principais processos.',
      },
    ],
  },
];