# Cadastro de usuário na tela inicial

## Alterações realizadas

- Inclusão da opção **Criar conta** na tela inicial de autenticação.
- Formulário com e-mail, senha e confirmação de senha.
- Validação de preenchimento, confirmação e mínimo de 6 caracteres.
- Integração do frontend com `POST /api/auth/cadastro`.
- Normalização do e-mail antes da persistência.
- Bloqueio de e-mail duplicado com HTTP 409.
- Senha armazenada exclusivamente com BCrypt.
- Novos cadastros recebem o perfil `ROLE_AVALIADOR` e ficam ativos.
- Retorno HTTP 201 após cadastro bem-sucedido.
- Mensagens visuais de sucesso e erro na própria tela.

## Fluxo de teste

1. Inicie o PostgreSQL e o backend.
2. Inicie o frontend.
3. Na tela inicial, selecione **Criar conta**.
4. Informe um e-mail ainda não cadastrado.
5. Informe e confirme uma senha com pelo menos 6 caracteres.
6. Clique em **Criar minha conta**.
7. Após a mensagem de sucesso, entre com as credenciais cadastradas.


## Atualização — seleção do tipo de conta

O formulário de cadastro agora permite selecionar um dos perfis abaixo:

- `ROLE_GESTOR` — Gestor
- `ROLE_ADMIN` — Administrador
- `ROLE_AVALIADOR` — Avaliador
- `ROLE_ANALISTA` — Analista

O perfil selecionado é enviado ao backend e validado por meio do enum `Usuario.Perfil`. Valores diferentes dos quatro perfis permitidos são rejeitados com HTTP 400.

> Atenção: permitir a criação pública de contas administrativas concede acesso privilegiado sem aprovação prévia. Em produção, recomenda-se restringir o perfil `ROLE_ADMIN` a administradores já autenticados.
