# ISO 9241-17 — Correções Lote 3

Este lote conclui os pacotes pendentes P9 e P10 da matriz consolidada.

## P9 — Navegação direta entre seções extensas

### Ficha AS-IS
- Adicionada barra `Ir para:` com atalhos para:
  - Contexto e Identificação;
  - Amostras de Casos Reais;
  - Avaliação de Satisfação.
- Os atalhos usam rolagem suave e preservam a navegação sequencial por Tab/Shift+Tab.

### Plano de Governança
- Adicionada barra `Ir para:` com atalhos para:
  - Formulário;
  - Matriz;
  - Checklist;
  - Histórico, quando um processo estiver selecionado.

## P10 — Cancelamento, restauração e proteção contra perda de dados

### Ficha AS-IS
- Adicionado botão `Descartar alterações` para ficha já salva.
- Em ficha ainda não persistida, a ação aparece como `Limpar ficha`.
- A ação pede confirmação e restaura os dados persistidos/defaults, descartando o rascunho atual.
- Alterações em casos e notas de satisfação passaram a marcar a ficha como modificada.

### Plano de Governança
- Adicionado botão `Cancelar edição` para plano vigente e `Limpar formulário` para novo plano.
- Alterações não salvas são sinalizadas por `Alterações não salvas`.
- Trocar o processo selecionado com alterações pendentes exige confirmação.
- `Priorizar processos`, itens do menu lateral e logout exigem confirmação antes de abandonar alterações.
- Atualização/fechamento da página usa `beforeunload` para alertar sobre alterações não salvas.
- Após salvar ou cancelar, o estado de alterações pendentes é limpo.

## Arquivos alterados
- `plataforma-maturidade-frontend/src/pages/AsIs/FichaAsIs.jsx`
- `plataforma-maturidade-frontend/src/pages/Gestor/PlanoGovernanca.jsx`
- `plataforma-maturidade-frontend/src/components/AppLayout.jsx`
- `plataforma-maturidade-frontend/src/index.css`

## Testes recomendados
1. AS-IS: use os atalhos `Ir para:` e confirme a chegada às três seções.
2. AS-IS: altere um campo, clique em `Descartar alterações`, confirme e verifique a restauração.
3. Governança: use atalhos para Formulário, Matriz, Checklist e Histórico.
4. Governança: edite um campo e confirme a aparição de `Alterações não salvas`.
5. Governança: tente trocar de processo e cancele o diálogo; os dados editados devem permanecer.
6. Governança: tente abrir outro item do menu lateral e cancele; deve permanecer na tela.
7. Governança: clique em `Cancelar edição`; os valores do plano vigente devem retornar.
8. Governança: com alteração pendente, recarregue/feche a aba e confirme o alerta do navegador.
