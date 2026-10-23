# Dados e operação

Responsável pelo projeto: Pedro Vitor — PVcoding Studio. Documento técnico de apoio à operação; revisar com a realidade do negócio antes da publicação.

## Inventário

| Conjunto | Conteúdo | Acesso e finalidade | Prazo |
| --- | --- | --- | --- |
| Solicitações | Nome, e-mail, telefone opcional, tipo de projeto, investimento opcional e mensagem | Administrador, para responder ao orçamento | 90 dias inicialmente; ajustável entre 1 e 365 |
| Evidência de ciência | Data de recebimento e versão do aviso associadas ao pedido | Administrador, para rastrear o aviso aplicável | Mesmo prazo do pedido |
| Configurações | Destinatário privado, contato público de privacidade e prazo | Administrador; somente o contato de privacidade e o prazo são públicos | Enquanto o site estiver em operação |
| Histórico operacional | Ação administrativa, ID do registro e data; não contém conteúdo do cliente | Operador do banco, para investigação | 90 dias |
| Sessão administrativa | Token aleatório e CSRF em memória | Autenticação | 30 minutos inativa / máximo oito horas |
| Logs técnicos do provedor | Podem incluir IP e acesso, fora desta aplicação | Operação da hospedagem | Definir e documentar com o provedor |

Não há exportação pública, pesquisa pública de contatos ou cadastro de visitantes. Não coletar CPF, documentos ou dados sensíveis pelo campo de mensagem. Não reutilizar contatos para marketing sem análise de finalidade e base legal próprias.

O campo-isca é descartado antes de gravar. O servidor usa uma chave aleatória de envio, resumida com SHA-256 no banco, para impedir gravação repetida do mesmo envio. Ela não identifica o dispositivo nem serve como rastreador. É mantida somente com a solicitação.

## Atendimento ao titular

1. Configure o contato público no painel antes de habilitar o formulário. Monitore a caixa escolhida.
2. Registre o pedido de confirmação, acesso, correção ou eliminação em ferramenta restrita, com prazo de atendimento. Verifique identidade por meio proporcional, preferencialmente confirmando pelo contato já cadastrado; não solicite documentos por padrão.
3. Localize o registro nas páginas de Solicitações. Para fornecer acesso, use o detalhe autenticado e prepare uma resposta por canal seguro, apenas para o titular verificado. A versão atual não possui exportação automática nem edição de dados. Para uma correção, forneça os dados corrigidos por canal seguro e elimine o registro incorreto quando cabível; se precisar manter histórico de contratação, use um processo próprio documentado.
4. Para eliminação, use a opção do painel. Avalie obrigações legais ou justificativas de conservação fora do fluxo de orçamento, quando aplicáveis. Não prometa eliminação de contratos ou documentos sob obrigação de guarda.
5. Preserve o resultado do atendimento em registro mínimo e restrito. Se houver restauração de backup, reaplique as exclusões realizadas depois daquele backup antes de reabrir o sistema.

As solicitações do formulário não são usadas para decisões automatizadas. Revise o aviso e a base legal se incluir analytics, publicidade, integrações, newsletter ou outros usos.

## Banco e credenciais

Use conta exclusiva do MySQL, com acesso somente ao banco do site. Para o runtime, são necessários SELECT, INSERT, UPDATE e DELETE nas tabelas da aplicação. CREATE e INDEX são usados apenas na migração, com conta separada quando o provedor permitir. Não use conta root no site.

`site_settings` contém um registro cifrado. `quote_requests` contém o payload cifrado, metadados operacionais e índice de retenção. `admin_audit` contém eventos de uma única conta administrativa, sem IP ou conteúdo. O evento é registrado antes de leituras sensíveis e alterações; uma operação que falhe pode deixar um evento de tentativa. Esse histórico auxilia investigação, mas não é um log imutável nem identifica múltiplos operadores.

Armazene a chave de cifragem e o hash administrativo em gerenciador de segredos/variáveis privadas. A chave é indispensável para ler dados e backups: perdê-la torna o conteúdo irrecuperável. Troca de chave exige migração cifrada planejada; o painel não oferece rotação. Alterar o hash de senha exige reiniciar o processo e encerra as sessões. A aplicação suporta uma conta administrativa, sem cadastro público, recuperação automática ou múltiplos perfis.

## Backups e restauração

O backup de código anterior à alteração está em `.local-backups/before-admin-20261021-125521/`, ignorado pelo Git. Ele não é backup de produção, de credenciais ou de banco. Não existia banco configurado neste ambiente e não houve deploy nesta alteração.

Antes de publicar:

1. Salve uma versão do código implantado, dependências travadas, configurações privadas em cofre e um dump cifrado do banco. Mantenha a chave em local separado do dump.
2. Defina responsável, frequência e prazo dos backups; documente o prazo real no aviso se necessário. A exclusão no painel não apaga cópias históricas do provedor. Restrinja acesso, cifre os backups e programe o descarte.
3. Restaure em ambiente isolado. Verifique versão de esquema e chave, execute limpeza por retenção e reaplique pedidos de eliminação feitos após o backup. Nunca restaure registros apagados para a operação pública.
4. Teste uma leitura sintética, o login e o fluxo SMTP. Só então decida uma publicação ou restauração real.

Para desfazer apenas esta alteração local, pare o processo e restaure `public/`, `server/`, `docs/`, `tests/`, `package.json`, `package-lock.json`, `.env.example` e `.gitignore` do backup indicado; remova somente os novos arquivos desta entrega, após comparar com alterações posteriores. Reinstale com `npm ci`. Preserve `.env` e qualquer banco existente. A migração é aditiva, sem DROP. O servidor antigo não lê os novos registros: rollback de código não transfere os pedidos para e-mail e não substitui plano de recuperação de dados. A restauração completa em hospedagem ainda não foi testada.

## Incidentes e manutenção

Se houver suspeita de vazamento, restrinja acesso, revogue sessões reiniciando o processo, troque credenciais comprometidas e preserve evidências sem copiar mensagens de clientes para logs ou chamados públicos. Avalie alcance, titulares e necessidade de comunicação à ANPD e aos titulares conforme regras vigentes. Não substitua a chave antiga sem planejar a recuperação dos dados.

Monitore falhas de retenção, disponibilidade do MySQL e notificações pendentes. O painel pode reenviar avisos, mas não envia e-mails automaticamente após falhas. Sem banco disponível, não existe fallback em arquivos públicos. A aplicação limita tentativas por IP; ataques distribuídos exigem proteção adicional na borda da hospedagem.

Revise dependências com `npm audit`, controle a conta destinatária e proteja também a caixa de e-mail e a conta da hospedagem com autenticação forte. Uma troca de destinatário afeta as próximas notificações e os reenvios; não move mensagens antigas.

## Rotas

| Método e rota | Controle e resposta |
| --- | --- |
| GET `/api/health` | Estado mínimo, sem detalhes de configuração |
| GET `/api/privacy` | Apenas contato público, prazo e versão do aviso |
| POST `/api/orcamento` | Origem, limite de tentativas, ciência e idempotência; não retorna o conteúdo salvo |
| POST `/api/admin/login` | Origem, limite, hash de senha e cookie |
| GET `/api/admin/session` | Sessão válida; devolve token CSRF |
| POST `/api/admin/logout` | Sessão, origem e CSRF; revoga acesso |
| GET/PUT `/api/admin/settings` | Sessão; PUT também exige origem e CSRF |
| GET `/api/admin/quotes?page=1` | Sessão, 20 itens por página, contatos mascarados |
| GET/DELETE `/api/admin/quotes/:id` | Sessão; DELETE exige origem e CSRF |
| POST `/api/admin/quotes/:id/notify` | Sessão, origem, CSRF e limite; reenvia aviso sem dados pessoais |

## Base de referência

- [LGPD, texto compilado](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm): finalidade, necessidade, direitos e proteção.
- [Hostinger: MySQL com Node.js](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/): preparação do banco no provedor.
- [Hostinger: aplicações Node.js](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/): requisitos da hospedagem.
