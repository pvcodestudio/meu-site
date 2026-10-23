# Guia de edição e manutenção

Este guia explica a finalidade dos trechos mais importantes, para você personalizar a página com segurança. Autor do projeto: Pedro Vitor — PVcoding Studio. Para configuração, consulte também o [README](../README.md) e o [guia de dados](DADOS_E_OPERACAO.md).

## HTML: conteúdo e organização

O arquivo `public/index.html` contém a estrutura semântica do site:

- `<header>`: logo, menu e botão de contato.
- `<main>`: conteúdo principal.
- `<section id="inicio">`: apresentação de Pedro Vitor, chamada e ilustração do editor de código.
- `<section id="projetos">`: cartões de projetos, cada um criado com `<article>` e uma `<img>`.
- `<section id="servicos">`: tipos de site e sistema que você oferece.
- `<section id="sobre">`: apresentação pessoal e tecnologias.
- `<section class="process-section">`: etapas de contratação e desenvolvimento.
- `<section id="orcamento">`: formulário de contato.
- `<footer>`: assinatura e explicação do uso dos dados.

Se você quiser criar mais um projeto, copie um bloco `<article class="project-card">...</article>` e altere imagem, nome, texto e índice. Para criar outra tecnologia, insira um `<span>` dentro de `.tech-list`.

Os links de navegação como `href="#projetos"` procuram uma seção com `id="projetos"`. Se renomear um ID, ajuste os links correspondentes e a lista de IDs observados em `main.js`.

## CSS: cores e espaçamento

As primeiras linhas de `public/css/style.css` apresentam variáveis CSS (`:root`). Alguns exemplos:

```css
--bg: #080d15;       /* Cor do fundo geral. */
--blue: #178dff;     /* Azul principal da marca. */
--white: #f4f6f9;    /* Títulos e textos de alto contraste. */
--container: 1220px; /* Largura máxima do conteúdo. */
```

`.hero` e `.hero-layout` cuidam da primeira seção. O layout usa CSS Grid para manter texto à esquerda e ilustração de código à direita no desktop. Os cartões usam `.projects-grid` e `.project-card`. Em telas menores, as regras `@media` convertem tudo em uma coluna. Alterar `padding` e `gap` geralmente é mais seguro do que mexer em posicionamentos absolutos.

O editor de código no topo é uma composição visual feita em HTML e CSS, sem scripts de terceiros. Ele pode ser ajustado ou retirado sem afetar o formulário.

## JavaScript: menu e envio

O `public/js/main.js` é executado apenas quando o HTML terminou de carregar, graças ao atributo `defer`.

- `setMenuOpen()` abre e fecha o menu no celular, atualizando o atributo `aria-expanded`.
- O primeiro `IntersectionObserver` mostra elementos quando entram na tela.
- O segundo destaca o link da seção visível na navegação.
- O clique nos cartões de serviços preenche o tipo de projeto no formulário.
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

1. Substituir as imagens demonstrativas pelos seus projetos reais e ajustar os textos.
2. Definir a conta de e-mail de recebimento no ambiente do servidor.
3. Executar `npm run check` e testar o envio completo em navegador de computador e celular.
4. Revisar ortografia, informações comerciais, LGPD e política de privacidade.
5. Testar HTTPS, domínio, menu do celular e carregamento de todas as imagens.
6. Verificar a pasta de spam na primeira mensagem enviada e configurar autenticação do domínio.
