/** Regressões de proteção de dados. Pedro Vitor — PVcoding Studio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createVault, hashPassword, verifyPassword } from '../server/security.js';
import { readConfig } from '../server/config.js';
import { validEmail } from '../server/validation.js';

test('criptografia não expõe campos e usa IV diferente a cada gravação', () => {
  const vault = createVault(randomBytes(32).toString('hex'));
  const data = { email: 'cliente@example.com', message: 'Informação privada' };
  const first = vault.seal(data);
  assert.notEqual(first, vault.seal(data));
  assert.ok(!first.includes(data.email));
  assert.deepEqual(vault.open(first), data);
});
test('adulteração e chave incorreta impedem leitura do registro', () => {
  const vault = createVault('a'.repeat(64));
  const sealed = vault.seal({ name: 'Cliente' });
  const parts = sealed.split('.');
  const body = Buffer.from(parts[3], 'base64');
  body[0] ^= 1;
  parts[3] = body.toString('base64');
  assert.throws(() => vault.open(parts.join('.')));
  assert.throws(() => createVault('b'.repeat(64)).open(sealed));
  assert.throws(() => createVault('chave-curta'));
});
test('senha usa derivação com salt e rejeita senha incorreta', async () => {
  const hash = await hashPassword('senha-ficticia-de-teste');
  assert.notEqual(hash, await hashPassword('senha-ficticia-de-teste'));
  assert.equal(await verifyPassword('senha-ficticia-de-teste', hash), true);
  assert.equal(await verifyPassword('incorreta', hash), false);
  assert.equal(await verifyPassword({}, hash), false);
});
test('produção exige origem HTTPS, hash válido e MySQL remoto com TLS', () => {
  assert.throws(() => readConfig({ NODE_ENV: 'production', APP_ORIGIN: 'http://site.example' }));
  assert.throws(() => readConfig({ ADMIN_PASSWORD_HASH: 'senha-em-texto' }));
  const config = readConfig({
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://site.example',
    DB_HOST: 'db.example'
  });
  assert.equal(config.database.ssl.rejectUnauthorized, true);
  assert.equal(config.origin, 'https://site.example');
});
test('destinatário rejeita cabeçalhos injetados e múltiplos e-mails', () => {
  for (const value of ['a@b.com\r\nBcc:outro@b.com', 'a@b.com, c@d.com', '<a@b.com>', ['a@b.com']])
    assert.equal(validEmail(value), false);
});

test('contato privado de recebimento nunca vira contato público automaticamente', () => {
  const config = readConfig({ MAIL_TO: 'privado@example.com' });
  assert.equal(config.defaults.notificationEmail, 'privado@example.com');
  assert.equal(config.defaults.privacyEmail, '');
});
