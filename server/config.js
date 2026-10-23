/** Configuração privada do servidor. Autor: Pedro Vitor — PVcoding Studio. */
import { readFileSync } from 'node:fs';
import { validPasswordHash } from './security.js';

export function readConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const origin = env.APP_ORIGIN || 'http://localhost:3000';
  const url = new URL(origin);
  if (url.origin !== origin || (production && url.protocol !== 'https:'))
    throw new Error(
      'APP_ORIGIN deve ser uma origem HTTPS em produção, sem caminho ou barra final.'
    );
  if (!production && !['http:', 'https:'].includes(url.protocol))
    throw new Error('APP_ORIGIN inválida.');
  if (env.ADMIN_PASSWORD_HASH && !validPasswordHash(env.ADMIN_PASSWORD_HASH))
    throw new Error('ADMIN_PASSWORD_HASH inválido.');
  const dbHost = env.DB_HOST || '127.0.0.1';
  const localDatabase = ['127.0.0.1', 'localhost', '::1'].includes(dbHost);
  return {
    production,
    origin,
    port: Number(env.PORT || 3000),
    trustProxy: Number(env.TRUST_PROXY || 0),
    adminUser: env.ADMIN_USER || 'admin',
    passwordHash: env.ADMIN_PASSWORD_HASH || '',
    encryptionKey: env.DATA_ENCRYPTION_KEY,
    databaseConfigured: Boolean(env.DB_NAME && env.DB_USER && env.DATA_ENCRYPTION_KEY),
    database: {
      host: dbHost,
      port: Number(env.DB_PORT || 3306),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      charset: 'utf8mb4',
      timezone: 'Z',
      connectionLimit: 5,
      waitForConnections: true,
      queueLimit: 20,
      connectTimeout: 10000,
      ...(!localDatabase || env.DB_SSL_CA
        ? {
            ssl: {
              rejectUnauthorized: true,
              ...(env.DB_SSL_CA ? { ca: readFileSync(env.DB_SSL_CA, 'utf8') } : {})
            }
          }
        : {})
    },
    defaults: {
      notificationEmail: env.MAIL_TO || '',
      privacyEmail: env.PRIVACY_EMAIL || '',
      retentionDays: 90
    },
    mailFrom: env.MAIL_FROM || env.SMTP_USER,
    smtp:
      env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            host: env.SMTP_HOST,
            port: Number(env.SMTP_PORT || 465),
            secure: env.SMTP_SECURE === 'true',
            requireTLS: true,
            tls: { rejectUnauthorized: true },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          }
        : null
  };
}
