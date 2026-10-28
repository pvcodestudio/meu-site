# Guia de edição e manutenção

Este guia explica a finalidade dos trechos mais importantes, para você personalizar a página com segurança. Autor do projeto: Pedro Vitor — PVcoding Studio. Para configuração, consulte também o [README](../README.md) e o [guia de dados](DADOS_E_OPERACAO.md).

## HTML: conteúdo e organização

O arquivo `public/index.html` contém a estrutura semântica do site:

- `<header>`: logo, menu e botão de contato.
- `<main>`: conteúdo principal.
- `<section id="inicio">`: apresentação de Pedro Vitor e editor de código com digitação contínua.
- `<section id="projetos">`: projetos em linhas alternadas de imagem e contexto, usando `<article>` e `<img>`.
- `<section id="servicos">`: tipos de site e sistema que você oferece.
- `<section id="sobre">`: assinatura da marca, apresentação pessoal e tecnologias.
- `<section class="process-section">`: etapas de contratação e desenvolvimento.
- `<section id="orcamento">`: formulário de contato.
- `<footer>`: assinatura e explicação do uso dos dados.

Se você quiser criar mais um projeto, copie um bloco `<article class="project-card">...</article>` e altere imagem, nome, texto e links da captura completa. Para criar outra tecnologia, insira um `<span>` dentro de `.tech-list`.

Os links de navegação como `href="#projetos"` procuram uma seção com `id="projetos"`. Se renomear um ID, ajuste os links correspondentes e a lista de IDs observados em `main.js`.

Cada projeto tem sua própria linha. No segundo, o CSS coloca a imagem à direita; no HTML, a imagem continua antes do contexto. Abaixo de 760px, todos seguem a ordem do documento em uma coluna. As capturas completas abrem em outra aba, sem depender de JavaScript.

A Don Marco Barbearia possui uma demonstração de layout em `public/demonstracoes/don-marco/index.html`. A imagem e o link desse projeto abrem `/demonstracoes/don-marco/`. O conteúdo é estático, sem scripts de agendamento; os botões são desativados e o aviso no topo explica que se trata de uma apresentação visual. Os arquivos do portfólio principal, incluindo Matrix e editor digitando, continuam separados da demonstração.

A Central de Atendimento abre `/demonstracoes/central-atendimento/`, com a marca fictícia Nexo e exemplos próprios. `demo.js` só alterna as abas e o tema; ações do aplicativo ficam desativadas. Para atualizar esta apresentação, edite os textos fictícios do HTML. Não importe armazenamento, banco, configurações, logotipos ou mensagens da aplicação original. O cartão do portfólio usa `central-demonstracao.svg`; a antiga captura foi retirada da pasta pública.

## CSS: cores e espaçamento

As primeiras linhas de `public/css/style.css` apresentam variáveis CSS (`:root`). Alguns exemplos:

```css
--bg: #090c12; /* Cor do fundo geral. */
--blue: #3467eb; /* Azul da identidade do estúdio. */
--button: #2459cd; /* Fundo dos botões com texto branco. */
--text: #f1f4fa; /* Títulos e textos de alto contraste. */
--container: 1280px; /* Largura máxima do conteúdo. */
```

`.hero` e `.hero-layout` cuidam da primeira seção. O layout usa CSS Grid para manter texto à esquerda e o editor digitando à direita no computador. `.hero-visual` reúne o editor e sua pequena prévia. As imagens dos trabalhos ficam na seção de projetos, sem a moldura azul que havia sido rejeitada pelo autor. O portfólio usa `.projects-grid` e `.project-card`; os serviços usam uma lista de linhas em `.services-grid`. Os ajustes para telas menores ficam ao final do arquivo.

O editor fica na primeira tela, dentro de `.hero-visual`, e repete a digitação após uma pausa de 2,2 segundos. O bloco `.editor-code` tem uma instrução `prettier-ignore` porque a animação percorre os nós de texto: espaços e quebras de linha dentro das linhas do editor também seriam digitados. Mantenha cada linha visual em um único `<div>`, sem indentação entre seus elementos internos.

O autor pediu para preservar a abertura Matrix verde e a digitação original. Os atributos `data-matrix="always"` e `data-typing="always"` mantêm esses efeitos ativos, inclusive quando o navegador informa movimento reduzido. Sem esses atributos, o modo automático respeita a preferência do navegador. O carregamento pode ser dispensado por clique ou tecla e tem limite de oito segundos para não prender a página.

A fonte Space Grotesk é carregada de `public/assets/fonts/space-grotesk-variable.ttf`, pelo `@font-face` e pelo preload no HTML. A licença está no mesmo diretório. Não há requisição ao Google Fonts durante a navegação. Para trocar a fonte, ajuste o `@font-face`, o preload e a variável `--font` juntos.

Os estilos seguem a ordem das seções, com ajustes para tablet e celular ao final. Faça alterações na regra original, em vez de acrescentar versões concorrentes da mesma regra ao fim do arquivo. Os campos passam a usar texto de 16px no celular para evitar o zoom automático ao receber foco.

## JavaScript: menu e envio

O `public/js/main.js` é executado apenas quando o HTML terminou de carregar, graças ao atributo `defer`.

- `setMenuOpen()` abre e fecha o menu no celular, atualizando o atributo `aria-expanded`.
- Um `IntersectionObserver` evita digitar código quando o editor está fora da tela.
- Outro destaca o link da seção visível na navegação.
- O clique nos links dos serviços preenche o tipo de projeto no formulário.
- A ação `submit` valida os campos e manda os dados por `fetch('/api/orcamento')`.
- `showStatus()` apresenta confirmação ou erro, conforme a resposta do servidor.

O formulário **não envia e-mail diretamente do navegador**. Isso evitaria manter senhas expostas. O navegador envia JSON ao servidor; o servidor envia o e-mail autenticado.

## Servidor: Node.js e SMTP

`server/index.js` inicializa os serviços; `server/config.js` lê as variáveis privadas; `server/app.js` define as rotas. As rotas públicas principais são:

```text
GET  /api/health      Retorna estado mínimo, sem detalhes privados
GET  /api/privacy     Informa contato público, retenção e versão do aviso
POST /api/orcamento   Valida e salva o pedido cifrado antes da notificação SMTP
```

`server/validation.js` concentra limites e opções aceitas, separados das rotas para facilitar testes. Se adicionar um novo tipo em `<select id="projectType">` do HTML, inclua esse valor também em `TYPE_OPTIONS`. Faça o mesmo com as faixas de orçamento de `BUDGET_OPTIONS`.

As credenciais vão em `.env` e devem ser configuradas na hospedagem. O arquivo `.env.example` é somente um modelo e não deve receber senhas reais. O destinatário, o contato de privacidade e a retenção são editados em `/admin`. Senhas SMTP e chave de criptografia permanecem no servidor.

## Formulário e aviso de privacidade

O formulário mantém seus IDs e campos anteriores. A ciência do aviso foi acrescentada em `privacyAccepted`. `main.js` manda essa ciência, a versão do aviso e uma chave aleatória por envio. Se mudar os campos ou a finalidade, revise `validation.js`, o aviso em `server/views/privacy.html` e `NOTICE_VERSION` em `app.js`; mantenha a versão enviada por `main.js` igual à do servidor.

O rodapé aponta para `/privacidade` e `/admin`. O aviso publica apenas o e-mail específico de privacidade e o prazo vigente. A assinatura e os metadados da página identificam Pedro Vitor — PVcoding Studio.

## Área administrativa

`server/views/admin.html` contém login e os painéis Configurações e Solicitações, com HTML semântico, rótulos de formulário e diálogo de detalhes. `public/css/admin.css` define uma interface própria, com cores da marca, foco visível, controles de pelo menos 48 px e adaptação para celular. Não depende das animações do portfólio.

`public/js/admin.js` alterna os painéis, envia alterações com CSRF, pagina as solicitações e exibe dados com `textContent`. Não substitua isso por `innerHTML` com conteúdo de clientes. O cookie de sessão é criado pelo servidor; o token CSRF fica apenas na memória. Encerrar a sessão limpa os dados apresentados. A exclusão pede confirmação e não possui lixeira.

`server/database.js` concentra SQL parametrizado e cifra o conteúdo usando `security.js`. O esquema está em `schema.sql`; alterações futuras precisam de migração própria, sem editar tabelas diretamente em produção. Nunca mova arquivos privados para `public/`.

## Checklist antes de apresentar aos clientes

1. Manter as imagens e descrições alinhadas aos projetos que você quer apresentar.
2. Definir a conta de e-mail de recebimento no ambiente do servidor.
3. Executar `npm run check` e testar o envio completo em navegador de computador e celular.
4. Revisar ortografia, informações comerciais, LGPD e política de privacidade.
5. Testar HTTPS, domínio, menu do celular e carregamento de todas as imagens.
6. Verificar a pasta de spam na primeira mensagem enviada e configurar autenticação do domínio.
