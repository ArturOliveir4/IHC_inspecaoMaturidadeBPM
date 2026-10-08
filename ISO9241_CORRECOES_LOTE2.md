# ISO 9241-17 — Correções do Lote 2

Este lote parte do **Lote 1** e implementa os pacotes **P2, P5, P6 e P7** da matriz consolidada.

## P2 — Diferenciação de valores carregados e valores padrão

### Ficha AS-IS
- Campos carregados de uma ficha já salva recebem fundo azul suave e indicação `Valor carregado da ficha salva`.
- Valores padrão, como `CRPA / PROGRAD`, `Falta de Padronização` e `Dias Úteis`, recebem indicação explícita enquanto ainda não foram alterados.
- O destaque de valor carregado deixa de ser aplicado quando o usuário modifica o campo.

### Plano de Governança
- Ao editar um plano vigente, campos carregados recebem fundo azul suave.
- É exibida uma legenda explicando a codificação visual.
- `Mensal` é identificado como valor padrão em um plano novo.

### Alertas de Acompanhamento
- No modo de edição, valores carregados do alerta recebem fundo azul suave.
- `Mensal` e `Ativo` são identificados como valores padrão no modo de criação.
- A seleção automática do primeiro processo foi removida; o usuário passa a escolher explicitamente o processo do alerta.

## P5 — Dimensionamento de campos textuais

### Ficha AS-IS
- `Nome do Processo` passou a ser exibido em área multilinha somente leitura.
- `Observação` de cada caso passou de `input` para `textarea`, com espaço maior e redimensionamento vertical.

### Plano de Governança
- As três observações do checklist passaram de `input` para `textarea` multilinha.
- O campo `Gatilhos para novo ciclo` passou a exibir quatro linhas.

### Alertas de Acompanhamento
- `Título do alerta` passou de campo de uma linha para `textarea` de duas linhas, evitando deslocamento horizontal para títulos realistas.
- `Gatilho / ação pendente` passou a exibir quatro linhas.

## P6 — Feedback específico e validação contextual

### Comportamento comum
- Campos inválidos recebem borda vermelha e mensagem imediatamente abaixo do controle.
- Mensagens do backend em `response.data.error` são preservadas quando disponíveis.
- Ao tentar salvar um formulário com erro, o primeiro controle inválido recebe foco.

### Ficha AS-IS
- Validação contextual para setor, data da medição, responsável, IDs dos casos, datas e tempo.
- Validações de caso também são executadas ao sair do campo (`blur`).
- Mensagens específicas do backend são exibidas ao usuário, corrigindo o uso anterior de apenas `response.data.message`.

### Plano de Governança
- Validação contextual de processo, dono, instrumento, periodicidade e gatilhos.
- Erros de regra de negócio devolvidos pelo backend passam a ser exibidos em vez de `Erro ao salvar o plano.` genérico.
- A mensagem é associada ao campo quando é possível identificar a causa.

### Alertas de Acompanhamento
- Validação contextual de processo, título, data de referência e gatilho.
- Erros do backend são associados ao campo relacionado quando a mensagem permite essa identificação.

## P7 — Validação cruzada de datas da Ficha AS-IS

A validação foi implementada tanto no frontend quanto no backend:

- Se uma das datas opcionais do período da amostra for preenchida, a outra também deve ser informada.
- `Data Fim da amostra >= Data Início da amostra`.
- `Data Fim do caso >= Data Início do caso`.
- Quando o período da amostra estiver definido, cada caso deve permanecer dentro desse intervalo.
- `Tempo Total >= 0` continua sendo validado.

No backend, as regras foram adicionadas em `KpiAsIsService.validarRequestGuardrails`, impedindo persistência de dados inconsistentes mesmo que a validação do navegador seja contornada.

## Arquivos alterados

- `plataforma-maturidade-frontend/src/index.css`
- `plataforma-maturidade-frontend/src/pages/AsIs/FichaAsIs.jsx`
- `plataforma-maturidade-frontend/src/pages/Gestor/PlanoGovernanca.jsx`
- `plataforma-maturidade-frontend/src/pages/Gestor/AlertasAcompanhamento.jsx`
- `plataforma-maturidade-backend/src/main/java/com/profnit/uepb/maturidade/service/KpiAsIsService.java`

## Testes recomendados

1. Abrir uma Ficha AS-IS já salva e verificar os campos azuis; editar um valor e confirmar que o destaque desaparece.
2. Criar uma Ficha AS-IS nova e verificar as indicações de valores padrão.
3. Informar Data Fim anterior à Data Início em um caso e confirmar mensagem junto ao campo.
4. Definir período da amostra e criar caso fora do intervalo; o salvamento deve ser bloqueado.
5. Preencher apenas uma das datas opcionais da amostra; o sistema deve solicitar a outra.
6. Inserir texto longo em Observação do caso e confirmar quebra de linha sem rolagem horizontal.
7. Editar um Plano de Governança vigente e verificar a diferenciação visual dos valores carregados.
8. Deixar Dono/Gatilhos vazios e sair do campo; verificar mensagem contextual.
9. Inserir observação longa no checklist e confirmar que o textarea acomoda o conteúdo.
10. Em Alertas, confirmar que nenhum processo é selecionado automaticamente.
11. Tentar salvar um alerta sem Título; verificar mensagem junto ao campo e foco no primeiro erro.
12. Inserir o título `Revisão semestral dos indicadores de desempenho do processo` e confirmar que ele é exibido em duas linhas, sem rolagem horizontal.
13. Editar um alerta existente e verificar o fundo azul dos valores carregados e a legenda correspondente.

## Validação técnica realizada neste ambiente

- Os três arquivos JSX modificados foram analisados pelo compilador TypeScript em modo de parsing JSX, sem erros de sintaxe.
- O `npm run build` não pôde ser concluído porque as dependências do frontend não estavam instaladas e a instalação excedeu o tempo disponível.
- A compilação Maven do backend não pôde ser concluída porque o wrapper tentou baixar a distribuição do Maven e o ambiente não conseguiu acessar o repositório remoto.
