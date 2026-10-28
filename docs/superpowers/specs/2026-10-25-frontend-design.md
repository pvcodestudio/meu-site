# PVcoding Studio — aplicação da skill frontend-design

> Direção visual rejeitada pelo usuário após a implementação. A orientação atual é manter o editor digitando em loop na primeira tela, preservar a abertura Matrix verde original e retirar a moldura azul com screenshot. Essas escolhas explícitas têm prioridade sobre o plano histórico abaixo.

Referência solicitada: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md

## Brief e decisões

Portfólio de Pedro Vitor para clientes que precisam de sites e sistemas. Manter o escuro com azul já escolhido pelo usuário. A ação principal continua sendo pedir um orçamento. Texto natural, comentários úteis e código nativo.

## Sistema visual

- Fundo: `#090c12`; superfície: `#111923`; azul da marca: `#3467eb`; botão: `#2459cd`; texto: `#f1f4fa`; texto secundário: `#abb6c7`.
- Space Grotesk variável, hospedada localmente com licença OFL. Títulos de 40 a 104px, texto de 15 a 17px; monoespaçada apenas no editor de código.
- Conteúdo alinhado à esquerda. Primeira tela com título grande e uma interface real em uma área azul. Projetos em linhas alternadas de imagem e descrição. Serviços em lista com descrição. Editor secundário na apresentação pessoal. Formulário direto com os mesmos contratos da API.

```text
marca             navegação             orçamento

título de duas linhas     interface real
apresentação + ação       sobre área azul

imagem do projeto        contexto
contexto                 imagem do projeto
imagem do projeto        contexto

serviço        descrição        orçamento
serviço        descrição        orçamento
serviço        descrição        orçamento

editor de código         sobre Pedro Vitor
etapas                   lista em sequência
conversa                 formulário
```

## Crítica antes de construir

O visual anterior repetia cartões, números sem sequência, rótulos em caixa alta e frases destacadas pela cor. Esta versão usa as capturas reais como elemento principal, reduz as molduras e reserva números para as etapas. O azul continua por preferência do usuário. A primeira proposta manteria o editor como abertura; foi revista para colocar um trabalho real nessa posição e dar contexto comercial imediato.

## Execução e verificação

1. Guardar backup e manter os campos, IDs e opções do orçamento.
2. Refazer composição e folha CSS, sem camada adicional de sobrescritas.
3. Respeitar movimento reduzido na abertura e no editor; verificar a preferência também quando mudar durante a sessão.
4. Rodar testes, formatação, auditoria HTTP/DOM e revisão independente do código.
5. Não afirmar inspeção visual: a integração de navegador está sem conexões. Não repetir a execução local bloqueada anteriormente.

Sem publicação, mudanças no banco ou credenciais. A fonte é o único novo recurso de produção, sem dependências novas.
