# Registro de validação

Pedro Vitor — PVcoding Studio. Alteração local de 21 de outubro de 2026.

## Executado

- `npm run check`: sintaxe de todos os módulos JavaScript e **28 testes aprovados**, sem falhas.
- API HTTP em porta temporária: autenticação, cookie HttpOnly/SameSite, CSRF, origem, validação, ciência do aviso, idempotência, listagem mascarada, consulta autenticada, exclusão, revogação, inatividade, limites e erros controlados.
- Criptografia: cifragem aleatória, leitura íntegra, rejeição de adulteração e de chave incorreta; hash de senha com salt.
- Falhas simuladas: indisponibilidade do banco não envia e-mail nem expõe erro interno; falha SMTP preserva o pedido e permite nova tentativa.
- Interface DOM com jsdom: login, alteração do destinatário, envio do token CSRF, alternância de seção, consulta de detalhes, limpeza de dados após expiração e conteúdo malicioso apresentado como texto. Campos originais do formulário permanecem; ciência é obrigatória e não pré-marcada.
- Nodemailer: geração local de notificação em texto puro, sem conteúdo pessoal do cliente. Não houve entrega em caixa real.
- `npm audit --omit=dev`: **zero vulnerabilidades conhecidas** nas dependências de produção consultadas. Nodemailer foi atualizado para corrigir avisos da versão anterior.
- Inicialização real do servidor em `http://localhost:3101`, sem banco configurado: `/`, `/admin`, `/privacidade`, CSS, JavaScript e `/api/privacy` responderam 200. O painel e a API pública de privacidade retornaram `Cache-Control: no-store`. `/.env` e `/server/schema.sql` responderam 404. Formulário respondeu 503, sem simular recebimento.

O sandbox bloqueou a criação dos subprocessos do test runner com `spawn EPERM`. A verificação completa foi repetida fora dessa limitação e aprovada. Não foi necessário alterar o funcionamento dos testes para ignorar falhas.

## Não executado

- `npm run test:mysql`: **um teste ignorado**, pois não há MySQL real nem banco de teste configurado. O teste existe e exige banco vazio, nome iniciado por `pvcoding_test_` e autorização explícita pela variável `RUN_MYSQL_TESTS=1`.
- Entrega SMTP, spam, SPF, DKIM e DMARC: dependem de conta e domínio ainda não definidos.
- Publicação Hostinger, HTTPS real, proxy, permissões do banco, reinicialização de produção, retenção no provedor e restauração de backup: dependem do plano e da configuração da hospedagem.
- Inspeção visual em navegador, leitor de tela e celulares reais: não houve navegador de automação disponível. Os testes DOM não comprovam aparência, foco real do diálogo ou comportamento em cada dispositivo.
- Revisão jurídica e operacional de LGPD: a entrega inclui controles e documentação, não certificação de conformidade.

## Conferência antes de publicar

1. Configurar ambiente e executar a migração conforme o README; usar credenciais privadas e preservar a chave de cifragem.
2. Executar a suíte MySQL no ambiente descartável e registrar o resultado.
3. Reiniciar o servidor após instalar a atualização. Um processo que já estava em execução continua com o código antigo até reiniciar.
4. Abrir o painel em desktop e celular, navegar por teclado, verificar foco, contraste, rótulos, diálogo e encerramento de sessão.
5. Configurar os dois e-mails e o prazo; revisar o aviso público com o responsável pelo tratamento.
6. Enviar apenas dados sintéticos, conferir armazenamento, notificação, consulta, exclusão e limpeza por retenção.
7. Testar restauração em ambiente isolado e definir o descarte dos backups antes de receber dados reais.
