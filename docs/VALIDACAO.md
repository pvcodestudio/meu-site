# Registro de validação

Pedro Vitor — PVcoding Studio.

## Central de Atendimento fictícia — 25 de outubro de 2026

- Apresentação adicionada em `/demonstracoes/central-atendimento/`, usando somente a folha visual da Central recebida. HTML, marca Nexo, logo, mensagens, contatos, e-mails, notas e histórico são novos e fictícios.
- O único JavaScript público da apresentação é `demo.js`, que alterna as dez abas por clique/teclado e o tema claro/escuro. Ações de aplicativo ficam desativadas; não há login, envio, banco, armazenamento ou acesso a serviços da Central original.
- A captura anterior do portfólio foi retirada da pasta pública e substituída pela ilustração `central-demonstracao.svg`, com marca e textos fictícios. O arquivo anterior permanece apenas em `.local-backups/before-central-demo-20261025/`.
- Dois testes de integração foram observados falhando antes da implementação e passaram depois. Verificam recursos locais, ausência dos módulos e logos originais, arquivos privados indisponíveis, campos de leitura e navegação de abas/tema sem rede ou armazenamento.
- `npm.cmd run check`: **43 testes aprovados**, sem falhas. Auditoria HTTP/DOM do portfólio aprovada para três páginas e 17 recursos. Foto, Matrix e editor na abertura preservados.
- Revisão independente somente por código não identificou exposição de dados reais ou credenciais. Dois apontamentos de cabeçalho responsivo e contraste da aba ativa foram corrigidos: contêiner exigido pela CSS original restaurado, navegação em linhas próprias no celular e fundo ativo escuro com texto branco.
- Sem publicação. A inspeção visual renderizada continua pendente pela indisponibilidade do navegador registrada nas revisões anteriores.

## Demonstração corrigida pelo RAR — 25 de outubro de 2026

- A versão do ZIP anterior foi substituída pelo material de `Don-Marco-Barbearia-Etapa-1-Codigo-Documentacao.rar` enviado em seguida pelo autor.
- Página inicial “Seu corte, do jeito que você gosta”, catálogo com quatro serviços, galeria, informações e layout ilustrativo do agendamento disponíveis por âncoras. Imagens, folhas CSS e fontes foram importadas do arquivo correto.
- Somente recursos de apresentação foram copiados para a pasta pública. A demonstração não possui scripts de aplicativo, formulários, diálogos de acesso ou integrações ativas; os controles de ação ficam desativados. Configurações, chaves, banco local e backend do arquivo recebido não foram publicados.
- O teste de integração foi atualizado e observado falhando contra a demonstração antiga. Após a substituição, `npm.cmd run check` aprovou **41 testes**, sem falhas. A validação inclui imagens, ícones, fontes, CSS com versão na URL, destinos internos, controles desativados e respostas 404 para arquivos privados.
- O código digitando, a abertura Matrix e a foto de Pedro Vitor no portfólio foram preservados. Inspeção visual renderizada continua pendente pela limitação registrada anteriormente.

## Demonstração visual Don Marco — 25 de outubro de 2026

- Layout importado do ZIP fornecido pelo autor para `/demonstracoes/don-marco/`. Apenas HTML, CSS, imagens e fontes locais; os scripts de agendamento não foram publicados nem executados durante a importação.
- Serviços, barbeiros, datas, horários e resumos estão preenchidos diretamente no HTML. A confirmação e os demais controles do agendamento ficam desativados. A faixa superior identifica a demonstração e oferece retorno ao portfólio.
- O trabalho Don Marco no portfólio passou a abrir a demonstração, mantendo o editor digitando e a abertura Matrix do site principal.
- `npm.cmd run check`: **41 testes aprovados**, sem falhas. O teste de integração foi observado falhando antes da implementação e passando depois; cobre link do portfólio, rota, conteúdo preenchido, recursos locais, controles desativados e ausência de scripts de agendamento.
- A página demonstrativa respondeu 200 na prévia local. Auditoria do portfólio aprovada para três páginas e 15 recursos. Inspeção visual em navegador continua pendente pela limitação registrada anteriormente.

## Correção após avaliação do autor — 25 de outubro de 2026

- Editor devolvido à primeira tela, com realce de sintaxe, digitação contínua e pausa entre ciclos. A abertura Matrix verde, seu brilho e sua ativação original foram restaurados do backup.
- Moldura azul e captura de projeto removidas da abertura; os trabalhos continuam na seção de projetos com imagens completas. Assinatura da marca restaurada na apresentação pessoal.
- Os atributos `data-matrix="always"` e `data-typing="always"` preservam os efeitos explicitamente solicitados pelo autor. O modo automático continua respeitando a preferência por movimento reduzido quando esses atributos não estão presentes.
- Os três testes que reproduziram a regressão falharam antes da correção e passaram após a restauração. `npm.cmd run check`: **40 testes aprovados**, sem falhas.
- Auditoria HTTP/DOM: três páginas e 14 recursos disponíveis; menu, Escape, foco e seleção dos serviços aprovados. O CSS e o JavaScript têm nova versão na URL para evitar reaproveitar os arquivos anteriores pelo cache.
- Backup do estado rejeitado: `.local-backups/before-restoring-animations-20261025/`. Inspeção visual renderizada continua pendente, conforme a limitação registrada nas revisões anteriores.

## Aplicação da skill frontend-design — 25 de outubro de 2026

- Skill solicitada e lida: https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md
- Direção registrada em `docs/superpowers/specs/2026-10-25-frontend-design.md`: identidade escura com azul, captura de projeto real na abertura, Space Grotesk local, trabalhos em linhas alternadas e serviços em lista.
- `npm.cmd run check`: **40 testes aprovados**, sem falhas, incluindo os novos contratos de movimento reduzido e digitação em um único ciclo.
- Os testes de dispensa da abertura, código estático para movimento reduzido, mudança da preferência durante a sessão e fim da digitação sem repetição falharam contra o comportamento anterior e passaram após as mudanças. Um teste existente passou a cobrir o fim da animação; o novo teste cobre a mudança da preferência durante a sessão.
- Prettier aprovou HTML, CSS, JavaScript e testes alterados. A folha CSS foi substituída de forma integral, sem camada de sobrescritas adicionada à versão anterior.
- Auditoria HTTP/DOM: três páginas e 14 recursos disponíveis, com IDs, destinos internos e referências acessíveis conferidos. Menu, Escape, devolução de foco e seleção do serviço no formulário aprovados.
- A fonte local respondeu 200, com tipo `font/ttf`, 136.676 bytes e cabeçalho TrueType válido. Licença OFL incluída em `public/assets/fonts/`. Sem dependências de produção novas ou chamadas ao Google Fonts durante a navegação.
- Contraste calculado dos tokens: texto branco no botão 6,20:1, hover 7,75:1; texto principal 17,77:1 e texto secundário na superfície 8,63:1. Esses cálculos não substituem a inspeção do texto renderizado.
- Revisão independente concluída: contratos do formulário, arquivos locais, pontos de quebra e ordem dos projetos conferidos. O apontamento de contraste insuficiente na borda dos campos foi corrigido, passando a usar `#657994`.
- Prévia mantida em `http://127.0.0.1:4173`, sem banco ou SMTP; não simula envio de orçamento.
- Inspeção visual ainda **pendente**: a integração de navegador continuou sem conexões. A execução de Chrome bloqueada na revisão anterior não foi repetida nem contornada. Não foram produzidas capturas de tela.
- Backup do estado anterior em `.local-backups/before-frontend-skill-20261025/`. Sem publicação ou alterações em credenciais.

## Refinamento anterior — 25 de outubro de 2026

- `npm.cmd run check`: sintaxe JavaScript verificada e **39 testes aprovados**, sem falhas.
- Prettier: HTML, CSS, script de privacidade, views, novos testes e guia de edição aprovados.
- Revisão HTTP e DOM local: três páginas (`/`, `/admin` e `/privacidade`) e 13 recursos responderam 200; IDs, destinos internos e referências acessíveis foram conferidos. Menu, fechamento por Escape, devolução de foco e seleção do tipo de projeto pelo serviço também passaram.
- A cópia recebida tinha três falhas: as duas views não estavam presentes e espaços de indentação prolongavam a digitação do editor. Os testes existentes passaram depois das correções.
- Revisão independente do código: dois apontamentos corrigidos. O fundo dos botões principais passou a ter contraste de 5,33:1 com texto branco (6,57:1 ao passar o mouse). O aviso de privacidade apresenta o prazo somente após consultar a configuração e informa indisponibilidade em caso de erro. Quatro testes novos cobrem esses estados; todos falharam antes da correção e passaram depois.
- Prévia local em `http://127.0.0.1:4173`, sem acesso às credenciais, ao MySQL ou ao SMTP. O formulário dessa prévia retorna indisponibilidade ao tentar enviar; não simula recebimento.
- Conferência visual de desktop e celular **pendente**: não havia navegador conectado à integração e a revisão automática bloqueou a execução do Chrome local, retornando `blocked by policy`, sem detalhar a razão. A revisão estática não comprova renderização ou ausência de transbordamento em dispositivos reais.
- Backups do HTML, CSS e script principal originais em `.local-backups/before-design-20261025/`. Sem publicação ou alterações nas credenciais.

## Registro anterior — 21 de outubro de 2026

Os resultados abaixo pertencem à validação anterior e não substituem os resultados de 25 de outubro.

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
