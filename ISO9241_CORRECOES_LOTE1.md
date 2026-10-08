# Correções ISO 9241-17 — Lote 1

Este lote inicia a adequação dos três cadastros inspecionados. O objetivo foi priorizar correções visuais e estruturais de baixo risco, compartilhadas ou já comprovadas pela inspeção.

## Implementado

### P1 — Orientação integrada
- Ficha AS-IS: orientação no cadastro de processo e na ficha principal.
- Plano de Governança: orientação sobre sequência de preenchimento, versionamento e salvamento automático do checklist.
- Alertas de Acompanhamento: orientação contextual para criação e edição.

### P3 — Campos obrigatórios
- Ficha AS-IS: marcação visual `*` nos campos `required` e nos cabeçalhos obrigatórios da tabela de casos.
- Alertas de Acompanhamento: marcação visual `*` em Processo, Título, Data de referência e Gatilho / ação pendente.
- Inclusão de `aria-required="true"` nos controles obrigatórios alterados.

### P4 — Foco inicial
- Ficha AS-IS: foco inicial no Nome do Processo na tela de cadastro e em Setor Responsável na ficha.
- Plano de Governança: foco inicial em Processo priorizado.
- Alertas de Acompanhamento: foco inicial em Processo.

### P8 — Ajustes estruturais específicos da Ficha AS-IS
- O título principal passa a manter explicitamente `Ficha AS-IS — <processo>`.
- Unidade de Tempo é apresentada antes da tabela de casos.
- Campos opcionais Data Início/Fim da Amostra foram movidos para depois dos campos obrigatórios dos casos.
- O cabeçalho de Tempo informa de forma visível `valor mínimo: 0`.

### P11 — Estado desabilitado no Plano de Governança
- Padronização visual compartilhada de controles `disabled`.
- Campo Instrumento de monitoramento passa a apresentar a orientação `Selecione um processo para habilitar este campo.`.
- Durante carregamento, o campo apresenta `Carregando instrumentos disponíveis...`.

## Arquivos alterados
- `plataforma-maturidade-frontend/src/index.css`
- `plataforma-maturidade-frontend/src/pages/AsIs/FichaAsIs.jsx`
- `plataforma-maturidade-frontend/src/pages/Gestor/PlanoGovernanca.jsx`
- `plataforma-maturidade-frontend/src/pages/Gestor/AlertasAcompanhamento.jsx`

## Próximos lotes
Ainda permanecem, entre outros, os pacotes P2 (valores carregados/padrão), P5 (dimensionamento), P6 (feedback/validação contextual), P7 (datas AS-IS), P9 (âncoras), P10 (cancelamento/proteção contra perda de dados).

## Verificação recomendada
1. Abrir os três cadastros e confirmar a aparência dos `*` e blocos de orientação.
2. Confirmar que o foco inicial aparece no primeiro campo indicado.
3. No Plano de Governança, abrir a página sem processo selecionado e confirmar que Instrumento de monitoramento está visualmente desabilitado e acompanhado da orientação.
4. Na Ficha AS-IS, confirmar a nova ordem da seção de amostras e o texto `valor mínimo: 0`.
5. Repetir Tab/Shift+Tab após as alterações para garantir que não houve regressão de navegação.
