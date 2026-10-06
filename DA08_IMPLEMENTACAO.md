# DA08 (SEG-02) — Autenticação JWT com senhas criptografadas

## Diagnóstico

O projeto já utilizava `BCryptPasswordEncoder` no cadastro de usuários e na criação do administrador inicial. O login também validava a senha com `PasswordEncoder.matches` e gerava um JWT assinado.

Foram encontrados dois gaps:

1. a chave e o TTL do JWT estavam fixos dentro de `JwtService`;
2. não havia um `AuthenticationEntryPoint` explícito, portanto token ausente ou inválido não possuía garantia uniforme de resposta HTTP 401.

## Implementação

- JWT configurado por `security.jwt.secret` e `security.jwt.expiration-ms`;
- suporte às variáveis `JWT_SECRET` e `JWT_EXPIRATION_MS`;
- validação de chave mínima de 32 bytes para HS256;
- resposta JSON HTTP 401 para token ausente, expirado, adulterado ou malformado;
- manutenção do HTTP 403 apenas para usuário autenticado sem permissão;
- interceptor Axios remove token e usuário e redireciona imediatamente para `/login` ao receber 401;
- testes para geração, expiração, adulteração e configuração do JWT;
- teste para confirmar que BCrypt não armazena a senha em texto puro.

## Configuração recomendada em produção

```bash
JWT_SECRET=uma-chave-aleatoria-segura-com-no-minimo-32-bytes
JWT_EXPIRATION_MS=3600000
```

O exemplo acima configura o token para expirar em uma hora.

## Evidência da medida de resposta

1. Cadastrar um usuário e consultar a coluna de senha no PostgreSQL. O valor deve começar com um identificador BCrypt, como `$2a$`, e não pode ser igual à senha digitada.
2. Configurar temporariamente `JWT_EXPIRATION_MS=1000`.
3. Realizar login e aguardar mais de um segundo.
4. Acessar uma rota protegida.
5. Confirmar HTTP 401 na aba Network e redirecionamento para `/login`.
6. Repetir adulterando um caractere do token armazenado no navegador; a resposta também deve ser HTTP 401.
