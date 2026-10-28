# Demonstração de advocacia — plano de implementação

> Execução nesta sessão com as orientações de executing-plans; revisão independente ao final.

**Goal:** Substituir apenas o projeto MarketUp pela demonstração visual de Martins Advocacia.

**Architecture:** Preservar a estrutura dos três cards e o CSS do portfólio. Copiar HTML, imagens e estilos do projeto fornecido para `public/demonstracoes/advocacia/`, sem scripts de aplicativo, formulários ou contatos ativos. Usar fontes locais, navegação por âncoras e uma prévia SVG do layout.

**Tech Stack:** HTML, CSS, SVG, Node.js e testes HTTP/DOM existentes.

**Spec:** Pedido do usuário nesta conversa: retirar marketing, adicionar o projeto de `K:/Projetos pedro/landingpage-advocacia`, criar descrição e manter a estrutura do site, somente visual.

## Restrições

- Não modificar os arquivos de origem em K:.
- Preservar os outros dois projetos e o restante do portfólio.
- Nenhum agendamento, envio de dados, WhatsApp, telefone ou e-mail ativo na demonstração.
- Publicar nas branches `main` e `gh-pages`, preservando o caminho `/meu-site/` e `docs/.nojekyll`.

## Foco da revisão

- Recursos locais e fontes precisam funcionar no caminho da demonstração.
- A versão de celular deve permitir navegar sem o script original.
- Animações não podem esconder conteúdo sem JavaScript.
- Informações jurídicas e contatos devem estar claramente identificados como ilustrativos.
- A prévia e ambos os links do card devem abrir a demonstração.

## Tarefa 1: adicionar a demonstração e substituir o card

- [x] Escrever `tests/advocacia-demo.test.js`: abrir o terceiro projeto por HTTP real, verificar recursos locais, âncoras, ausência de formulários/scripts/contatos e preservação dos três cards.
- [x] Executar o teste e confirmar falha porque o terceiro card ainda aponta para MarketUp.
- [x] Criar `public/demonstracoes/advocacia/` com HTML estático, estilos, fontes e imagens; criar `public/assets/projetos/advocacia-demonstracao.svg`.
- [x] Substituir apenas o terceiro card em `public/index.html` com título, descrição, prévia e links.
- [x] Executar `npm run check`, inspecionar a prévia e revisar a implementação.
- [ ] Publicar arquivos alterados no GitHub e conferir o deploy e os recursos no endereço público.
