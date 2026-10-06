# US19 — Tabela do Plano de Governança

## Implementado

- Cadastro obrigatório de processo, dono, instrumento de monitoramento, periodicidade e gatilhos.
- Periodicidades permitidas: mensal, trimestral, semestral e anual.
- Matriz consolidada com a versão vigente de cada processo.
- Edição por versionamento: a versão atual deixa de ser vigente e uma nova versão é criada.
- Histórico completo por processo, com data, autor e número da versão.
- Acesso restrito a Gestor e Administrador.
- Acesso direto pelo painel inicial e pelo menu lateral.

## Endpoints

- `GET /api/planos-governanca`
- `GET /api/planos-governanca/processo/{processoId}/historico`
- `POST /api/planos-governanca`

## Observação de modelagem

Como a versão recebida do projeto não possui um campo explícito que marque processos como priorizados, a tela utiliza os processos cadastrados no Módulo 1. Quando essa marcação existir, a listagem pode ser filtrada no endpoint de processos sem alterar o versionamento do plano.
