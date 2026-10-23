/** Proteção de dados e credenciais. Autor: Pedro Vitor — PVcoding Studio. */
import {
  randomBytes,
  scrypt as derive,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(derive);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

export function validPasswordHash(value = '') {
  return /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(value);
}

export async function verifyPassword(password, hash) {
  if (!validPasswordHash(hash) || typeof password !== 'string' || password.length > 256)
    return false;
  const [, salt, expected] = hash.split('$');
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

export function createVault(encodedKey) {
  if (!/^[a-f0-9]{64}$/i.test(encodedKey || ''))
    throw new Error('DATA_ENCRYPTION_KEY deve conter 64 caracteres hexadecimais.');
  const key = Buffer.from(encodedKey, 'hex');
  return {
    seal(value) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      cipher.setAAD(Buffer.from('pvcoding:v1'));
      const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
      return [
        'v1',
        iv.toString('base64'),
        cipher.getAuthTag().toString('base64'),
        body.toString('base64')
      ].join('.');
    },
    open(value) {
      const [version, iv, tag, body, extra] = value.split('.');
      if (version !== 'v1' || !iv || !tag || !body || extra)
        throw new Error('Registro criptografado inválido.');
      const cipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
      cipher.setAAD(Buffer.from('pvcoding:v1'));
      cipher.setAuthTag(Buffer.from(tag, 'base64'));
      return JSON.parse(
        Buffer.concat([cipher.update(Buffer.from(body, 'base64')), cipher.final()]).toString('utf8')
      );
    }
  };
}

export const token = () => randomBytes(32).toString('hex');

// Os resumos evitam expor contatos antes da abertura explícita do registro.
export function maskQuote(quote) {
  const [local, domain] = quote.email.split('@');
  return {
    name: `${quote.name.slice(0, 1)}***`,
    email: `${local.slice(0, 1)}***@${domain}`,
    projectType: quote.projectType
  };
}
