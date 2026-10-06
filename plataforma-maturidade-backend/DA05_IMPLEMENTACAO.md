# DA05 (CONF-02) — Integridade transacional dos dados

## Diagnóstico

A maior parte das operações críticas já utilizava `@Transactional`, porém havia uma lacuna na edição de KPI TO-BE, que realizava escrita sem delimitação transacional explícita. Além disso, os métodos estavam sujeitos apenas à regra padrão do Spring, que executa rollback automático para `RuntimeException` e `Error`.

## Correção aplicada

As seguintes operações foram configuradas com:

```java
@Transactional(rollbackFor = Exception.class)
```

- início e retomada de avaliação;
- salvamento de resposta;
- atualização da etapa ativa;
- finalização da avaliação e geração do diagnóstico;
- cadastro e edição de KPIs AS-IS;
- cadastro e edição de KPIs TO-BE.

A propagação padrão `REQUIRED` mantém todas as chamadas internas no mesmo contexto transacional. Assim, por exemplo, a alteração do status da avaliação, a geração do diagnóstico e o registro de auditoria são confirmados conjuntamente. Se uma etapa falhar, nenhuma delas é confirmada.

## Comportamento esperado

Quando ocorre falha de conexão, timeout do banco, violação de restrição ou outra exceção durante a escrita:

1. a transação é marcada para rollback;
2. o PostgreSQL não confirma alterações parciais;
3. a API retorna erro ao frontend;
4. após a reconexão, o usuário pode repetir a operação;
5. somente a tentativa concluída integralmente é persistida.

## Teste de regressão

Foi adicionado `IntegridadeTransacionalDa05Test`, que verifica se todas as operações críticas continuam anotadas com `@Transactional(rollbackFor = Exception.class)`. Esse teste evita que futuras refatorações removam acidentalmente as fronteiras transacionais.

## Evidência prática recomendada

Em um ambiente de homologação com PostgreSQL:

1. inicie uma operação crítica;
2. interrompa a conexão com o PostgreSQL antes da conclusão;
3. confirme que a API retorna erro;
4. restabeleça a conexão;
5. consulte as tabelas envolvidas e verifique que nenhum registro parcial foi criado;
6. repita a operação e confirme que ela é concluída normalmente.

Para a finalização da avaliação, devem ser verificadas conjuntamente as tabelas de avaliação, diagnóstico e auditoria.
