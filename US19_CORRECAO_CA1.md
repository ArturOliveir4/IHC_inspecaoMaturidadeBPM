# Correção do CA1 — US19

## Alterações realizadas

1. `Processo` agora possui o atributo booleano `priorizado`.
2. A API `GET /api/processos/priorizados` retorna somente processos priorizados no Módulo 1.
3. A API `PATCH /api/processos/{id}/priorizacao` permite ao Analista/Admin registrar a priorização.
4. Foi criada a entidade `InstrumentoMonitoramento`, vinculada por chave estrangeira ao processo.
5. A API `GET /api/instrumentos-monitoramento?processoId={id}` lista apenas instrumentos ativos do processo.
6. A API `POST /api/instrumentos-monitoramento` registra instrumentos do Módulo 3.
7. `PlanoGovernanca` passou a armazenar a referência `instrumento_monitoramento_id`.
8. O nome do instrumento continua salvo como snapshot textual em cada versão, preservando o histórico mesmo que o cadastro do instrumento seja alterado posteriormente.
9. O backend bloqueia:
   - plano para processo não priorizado;
   - instrumento inexistente ou inativo;
   - instrumento pertencente a outro processo.
10. O frontend usa somente processos priorizados e apresenta um `select` com instrumentos reais do Módulo 3.

## Fluxo mínimo para teste

### Marcar um processo como priorizado

```http
PATCH /api/processos/1/priorizacao
Content-Type: application/json

{
  "priorizado": true
}
```

### Cadastrar um instrumento no Módulo 3

```http
POST /api/instrumentos-monitoramento
Content-Type: application/json

{
  "processoId": 1,
  "nome": "Painel de KPIs AS-IS/TO-BE",
  "descricao": "Painel utilizado para acompanhar os indicadores do processo."
}
```

Depois desses passos, o processo e o instrumento estarão disponíveis na tela da tabela de governança.

## Compatibilidade com dados anteriores

A coluna textual `instrumento_monitoramento` foi mantida como snapshot histórico. A nova FK `instrumento_monitoramento_id` é preenchida nas novas versões. Versões antigas continuam consultáveis mesmo sem uma referência retroativa.


## Fechamento do fluxo pela interface

Foi adicionada a tela **Preparar Plano de Governança**, acessível pelo painel inicial e pela própria tela da matriz. Nela, o Gestor pode marcar processos como priorizados e cadastrar instrumentos reais do Módulo 3. O backend também passou a autorizar o perfil Gestor nessas duas operações. Assim, não é necessário inserir dados manualmente no banco nem usar clientes externos de API.
