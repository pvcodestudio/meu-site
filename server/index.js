/** Inicialização do site. Autor: Pedro Vitor — PVcoding Studio. */
import 'dotenv/config';
import nodemailer from 'nodemailer';
import { createApp } from './app.js';
import { readConfig } from './config.js';
import { createRepository } from './database.js';

const config = readConfig();
const repository = config.databaseConfigured ? createRepository(config) : null;
if (repository) await repository.ready();
const mailer = config.smtp ? nodemailer.createTransport(config.smtp) : null;
async function cleanup() {
  if (!repository) return;
  const settings = await repository.settings();
  await repository.prune(settings.retentionDays);
}
await cleanup();
let cleaning = false;
const cleanupTimer = setInterval(
  async () => {
    if (cleaning) return;
    cleaning = true;
    try {
      await cleanup();
    } catch {
      console.error('Falha na limpeza de retenção; verificar o banco.');
    } finally {
      cleaning = false;
    }
  },
  60 * 60 * 1000
);
cleanupTimer.unref();
const server = createApp({ config, repository, mailer }).listen(config.port, () => {
  console.log(`PVcoding Studio: ${config.origin}`);
  if (!repository)
    console.warn('Formulário e painel aguardam configuração do MySQL e da criptografia.');
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    clearInterval(cleanupTimer);
    server.close(async () => {
      await repository?.close();
      mailer?.close();
      process.exit(0);
    });
  });
