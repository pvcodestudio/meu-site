# PVcoding Studio

Portfólio de Pedro Vitor, com formulário de orçamento e área administrativa. Autoria do projeto: **Pedro Vitor — PVcoding Studio**.

O projeto mantém HTML, CSS e JavaScript no navegador, Express no servidor e envio SMTP. O MySQL guarda as solicitações, as configurações de recebimento e um histórico operacional sem conteúdo de clientes. Não há cadastro de visitantes.

## Começar

Use Node.js 24 LTS e MySQL 8 ou MariaDB 10.6 ou superior. Instale as dependências com `npm ci`. Copie `.env.example` para `.env` **somente se esse arquivo ainda não existir**. Preserve as configurações já cadastradas.

1. Execute `npm run admin:credentials` no seu terminal privado. Guarde a senha em um gerenciador e preencha `ADMIN_PASSWORD_HASH` e `DATA_ENCRYPTION_KEY` no ambiente do servidor. O script não grava nem transmite os valores. Não envie sua saída por chat ou e-mail.
2. Crie um banco vazio e um usuário MySQL exclusivo. Informe `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` no ambiente. Use as credenciais de migração para executar `npm run db:migrate`.
3. Configure `APP_ORIGIN`, sem barra final: `http://localhost:3000` localmente; `https://seu-dominio` em produção. A origem precisa coincidir com o endereço aberto no navegador. Use `NODE_ENV=production` no servidor publicado.
4. Configure o SMTP autenticado: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`. Na porta 465, use `SMTP_SECURE=true`; na 587, use `false`, mantendo STARTTLS obrigatório. O servidor valida certificados.
5. Execute `npm start`. Acesse `/admin`, entre com o usuário `ADMIN_USER` e a senha gerada e abra **Configurações**. Informe o destinatário das notificações, o contato público de privacidade e o prazo de retenção. Salve.
6. Consulte `/privacidade` e faça um envio sintético antes de receber dados de clientes. Confira a lista, os detalhes e a notificação na caixa destinatária.

Não há senha padrão. Sem banco/chave/credencial administrativa e e-mails válidos, o formulário não confirma recebimento. `MAIL_TO` e `PRIVACY_EMAIL` são valores iniciais; depois do primeiro salvamento, o painel passa a ser a fonte das configurações. O contato público nunca é deduzido do destinatário privado.

## Hospedagem na Hostinger

O plano ainda não foi escolhido. Confirme que permite **executar Node.js**, além de oferecer MySQL. Hospedagem apenas estática não executa esta API. A Hostinger documenta a [conexão de MySQL a uma aplicação Node.js](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/) e a [criação de uma aplicação Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).

Envie o projeto sem `.env`, `node_modules`, `.local-backups`, dumps ou chaves. Defina as variáveis privadas no ambiente da hospedagem. Diretório do projeto: raiz; comando de instalação: `npm ci --omit=dev`; inicialização: `npm start`. A raiz pública é `public/`; **não publique a raiz do projeto como arquivos estáticos**. `server/views` é entregue pelas rotas apropriadas.

O MySQL local à hospedagem pode usar `127.0.0.1`, conforme a orientação do provedor. Conexões remotas exigem TLS com certificado validado; configure `DB_SSL_CA` se houver uma CA específica. Não exponha a porta do banco na internet indiscriminadamente.

Configure HTTPS. Atrás de proxy, ajuste `TRUST_PROXY` ao número real de proxies confiáveis; não use um valor arbitrário. Ele afeta cookies seguros, reconhecimento de HTTPS e limites por IP. Esta implementação usa **um único processo Node.js**: sessões e limites são locais ao processo. Vários processos exigem um armazenamento compartilhado de sessões/limites antes da expansão.

## Operação

- `/admin`: login, Configurações e Solicitações. Link disponível no rodapé do portfólio.
- O destinatário recebe um aviso com link para o painel, sem nome, telefone, e-mail ou mensagem do cliente. Responder ao cliente é uma ação do responsável, pelo contato consultado no painel.
- A solicitação é salva antes da notificação. Falha de SMTP não perde o pedido nem pede ao cliente que envie novamente. O painel permite reenviar a notificação; não existe fila automática de e-mails.
- A lista mascara nome e parte do e-mail; o domínio e o tipo do projeto continuam visíveis ao administrador. O detalhe completo exige sessão e gera registro operacional.
- “Excluir solicitação” remove o registro do banco ativo e pede confirmação. Não existe lixeira. Backups precisam de prazo e controle de acesso próprios.
- Sessão: até 30 minutos de inatividade, máximo absoluto de oito horas; sair revoga a sessão. Reiniciar o processo revoga todas as sessões. Não há recuperação de senha por e-mail: gere outro hash e reinicie o servidor. **Não substitua a chave de criptografia ao trocar a senha.**
- A limpeza roda ao iniciar e a cada hora. A redução do prazo elimina registros vencidos na próxima execução. Verifique alertas operacionais se a limpeza falhar.

## Proteção dos dados

Nome, e-mail, telefone, investimento e mensagem são cifrados juntos com AES-256-GCM, IV aleatório e verificação de integridade. As configurações também são cifradas. ID, data, versão do aviso, chave de deduplicação e estado de notificação ficam em claro. A chave está no ambiente, separada do banco. Isso protege uma cópia isolada do banco; um servidor comprometido com acesso à chave pode ler os dados.

Senhas usam scrypt com salt. Cookies administrativos usam HttpOnly, SameSite=Strict e Secure em produção. Alterações exigem origem autorizada e token CSRF. O navegador não guarda tokens ou formulários em localStorage. Consultas SQL são parametrizadas; dados exibidos no painel entram por `textContent`, sem interpretar HTML enviado pelo cliente. APIs privadas não podem ser armazenadas em cache. Credenciais e conteúdo de clientes não aparecem em erros ou logs da aplicação.

O envio requer ciência do aviso vigente, sem caixa pré-marcada. A finalidade prevista é responder ao orçamento e realizar procedimentos preliminares de contratação solicitados pelo titular, conforme [LGPD, art. 7º, V](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm). O checkbox registra ciência, não consentimento para publicidade. O prazo de 90 dias é uma decisão inicial do projeto, **não um prazo universal imposto pela LGPD**. O responsável deve justificar o prazo escolhido e revisar finalidade, operadores, canal de direitos e eventuais obrigações de conservação antes da publicação.

Consulte [DADOS_E_OPERACAO.md](docs/DADOS_E_OPERACAO.md) para inventário, direitos, backups, incidentes e restauração. As medidas implementadas não equivalem a certificação de conformidade jurídica.

## Testes

```text
npm run check       Sintaxe de todos os módulos e testes automatizados
npm test            Testes de validação, criptografia, API e interface DOM
npm audit           Avisos conhecidos nas dependências
npm run test:mysql  Integração opcional com MySQL real
```

A suíte normal usa HTTP real em portas temporárias, repositório em memória e SMTP simulado; não envia mensagens reais. O teste de transporte Nodemailer gera a mensagem localmente. Os testes de interface DOM verificam interações e inserção segura de texto, mas não substituem inspeção visual em navegador.

Para testar MySQL, use um banco **vazio e descartável** chamado `pvcoding_test_<sufixo>`. Defina `RUN_MYSQL_TESTS=1` e `DB_*` explicitamente no ambiente do terminal de teste; a suíte não carrega `.env`. O teste cria tabelas e dados sintéticos, verifica cifragem, consultas, deduplicação, retenção e exclusão. Deixa as tabelas para inspeção; descarte esse banco depois. Sem a flag, o teste aparece como ignorado, não como validação de integração aprovada.

## Arquivos

| Caminho | Responsabilidade |
| --- | --- |
| `public/index.html`, `public/css/style.css`, `public/js/main.js` | Portfólio, navegação, projetos e formulário público |
| `server/views/admin.html`, `public/css/admin.css`, `public/js/admin.js` | Área administrativa com páginas de configuração e consulta |
| `server/views/privacy.html`, `public/js/privacy.js` | Aviso de privacidade e informações públicas atualizadas |
| `server/index.js` | Inicialização, conexão, limpeza e encerramento |
| `server/app.js` | Rotas HTTP, sessão, CSRF, limites e notificações |
| `server/config.js` | Leitura e validação das variáveis privadas |
| `server/database.js`, `server/schema.sql` | Repositório MySQL e criação de tabelas |
| `server/security.js`, `server/validation.js` | Cifragem, hash, mascaramento e validação |
| `scripts/` | Credenciais locais, migração e verificação |
| `tests/` | Regressões automatizadas e integração opcional |

O [guia de edição](docs/GUIA_DE_EDICAO.md) explica cada parte da página pública. Alterações na finalidade ou nos campos devem atualizar também validação, aviso e testes.
