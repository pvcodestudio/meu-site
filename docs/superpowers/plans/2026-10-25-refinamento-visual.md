# Refinamento visual — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar o portfólio escuro com azul, com conteúdo natural e código legível.

**Architecture:** HTML semântico e uma folha CSS organizada por seção. Preservar contratos do JavaScript e da API existentes.

**Tech Stack:** HTML, CSS, JavaScript, Express e testes nativos do Node com JSDOM.

**Spec:** `docs/superpowers/specs/2026-10-25-refinamento-visual-design.md`

## Restrições

- Manter a identidade escura com azul e os recursos locais.
- Preservar IDs, formulário, segurança e painel existentes.
- Sem dependências de produção novas ou publicação.

## Pontos de revisão

Telas estreitas sem rolagem lateral; texto legível; navegação por teclado; opções dos serviços preenchendo o formulário; recursos e rotas locais disponíveis.

## Tarefa 1 — Hierarquia e conteúdo

- [x] Guardar cópia dos arquivos principais alterados.
- [x] Refinar abertura, projetos e textos em `public/index.html`.
- [x] Consolidar `public/css/style.css`, com responsividade e foco visível.
- [x] Preservar o editor e manter sua marcação compacta para evitar a digitação de espaços de indentação.

## Tarefa 2 — Rotas incompletas da cópia recebida

- [x] Recriar `server/views/admin.html` e `server/views/privacy.html` de acordo com os scripts existentes.
- [x] Reexecutar os testes que já falharam antes das alterações.

## Tarefa 3 — Verificação e documentação

- [x] Executar `npm.cmd run check` e verificar a formatação dos arquivos alterados.
- [ ] Conferir visualmente a página em tamanhos de desktop e celular — pendente por indisponibilidade do navegador e bloqueio da execução local.
- [x] Atualizar `docs/GUIA_DE_EDICAO.md` e registrar resultados.

## Registro

Baseline: 31 de 34 testes passaram. Falhas: duas relacionadas às views ausentes; uma relacionada a espaços de indentação que prolongam a animação de digitação. A cópia de trabalho não tem `.git`; alterações serão feitas nesta pasta, com backup local. As mudanças de estilo e conteúdo serão verificadas visualmente e pelos testes existentes, sem testes que apenas dupliquem a marcação.

Resultado: 39 testes aprovados, formatação aprovada e revisão HTTP/DOM aprovada para três páginas e 13 recursos. Revisão independente identificou contraste insuficiente nos botões e prazo de retenção sem confirmação da API; ambos corrigidos. O prazo recebeu quatro testes de regressão, observados falhando antes da correção e passando depois. Sem apontamentos de revisão adiados. Validação visual permanece explicitamente pendente; não houve tentativa de contornar o bloqueio do navegador.
