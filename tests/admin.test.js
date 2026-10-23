/** API real com banco e SMTP substituídos por doubles sem dados reais.
 * Autor: Pedro Vitor — PVcoding Studio.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { createApp, NOTICE_VERSION } from '../server/app.js';
import { hashPassword } from '../server/security.js';

const password = 'senha-sintetica-para-testes';
const passwordHash = await hashPassword(password);
const quote = {
  name: 'Cliente Sintético',
  email: 'cliente@example.com',
  phone: '11900000000',
  projectType: 'Sistema web',
  budget: '',
  message: 'Preciso de um sistema de atendimento.',
  website: '',
  privacyAccepted: true,
  noticeVersion: NOTICE_VERSION
};

async function fixture(t, options = {}) {
  const records = new Map();
  const keys = new Set();
  const audits = [];
  const messages = [];
  let settings = {
    notificationEmail: 'admin@example.com',
    privacyEmail: 'privacidade@example.com',
    retentionDays: 90
  };
  let clock = Date.now();
  const repository = {
    settings: async () => settings,
    saveSettings: async (value) => {
      settings = value;
    },
    insert: async (value, key, noticeVersion) => {
      if (options.failDatabase) throw new Error('password=segredo-cliente');
      if (keys.has(key)) return { duplicate: true };
      keys.add(key);
      const id = randomUUID();
      records.set(id, {
        id,
        quote: value,
        createdAt: new Date(),
        notificationStatus: 'pending',
        noticeVersion
      });
      return { id, duplicate: false };
    },
    list: async () => [...records.values()],
    get: async (id) => records.get(id),
    remove: async (id) => records.delete(id),
    notification: async (id, value) => {
      if (records.has(id)) records.get(id).notificationStatus = value;
    },
    audit: async (action, id) => audits.push({ action, id })
  };
  const config = {
    origin: 'http://localhost',
    production: false,
    trustProxy: 0,
    adminUser: 'admin',
    passwordHash,
    mailFrom: 'site@example.com',
    defaults: settings,
    ...options.config
  };
  const mailer = {
    sendMail: async (message) => {
      if (options.failSmtp) throw new Error('segredo-smtp');
      messages.push(message);
    }
  };
  const app = createApp({
    config,
    repository: options.noDatabase ? null : repository,
    mailer,
    now: () => clock
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      })
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(
    path,
    { method = 'GET', body, cookie, csrf, origin = config.origin, key, raw } = {}
  ) {
    return fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        ...(key ? { 'Idempotency-Key': key } : {})
      },
      ...(raw !== undefined
        ? { body: raw }
        : method !== 'GET'
          ? { body: JSON.stringify(body ?? {}) }
          : {})
    });
  }
  async function login() {
    const res = await request('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password }
    });
    assert.equal(res.status, 200);
    return {
      cookie: res.headers.get('set-cookie').split(';')[0],
      csrf: (await res.json()).csrfToken,
      header: res.headers.get('set-cookie')
    };
  }
  const submit = (value = quote, key = randomUUID()) =>
    request('/api/orcamento', { method: 'POST', body: value, key });
  return {
    request,
    login,
    submit,
    records,
    messages,
    audits,
    advance: (ms) => {
      clock += ms;
    }
  };
}

test('rotas administrativas não expõem dados sem autenticação', async (t) => {
  const f = await fixture(t);
  for (const path of ['/api/admin/settings', '/api/admin/quotes', '/api/admin/session']) {
    const res = await f.request(path);
    assert.equal(res.status, 401);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
  for (const path of [
    '/.env',
    '/server/schema.sql',
    '/.local-backups/index.before-central-project.html'
  ])
    assert.equal((await f.request(path)).status, 404);
});
test('login rejeita credenciais/origem incorretas e emite cookie protegido', async (t) => {
  const f = await fixture(t);
  assert.equal(
    (
      await f.request('/api/admin/login', {
        method: 'POST',
        body: { username: 'admin', password: 'errada' }
      })
    ).status,
    401
  );
  assert.equal(
    (
      await f.request('/api/admin/login', {
        method: 'POST',
        body: { username: 'admin', password },
        origin: 'https://outro.example'
      })
    ).status,
    403
  );
  const session = await f.login();
  assert.match(session.header, /HttpOnly/);
  assert.match(session.header, /SameSite=Strict/);
});
test('alteração exige sessão, origem e token CSRF; configuração persiste', async (t) => {
  const f = await fixture(t);
  const auth = await f.login();
  const change = {
    notificationEmail: 'novo@example.com',
    privacyEmail: 'dados@example.com',
    retentionDays: 30
  };
  assert.equal(
    (await f.request('/api/admin/settings', { method: 'PUT', cookie: auth.cookie, body: change }))
      .status,
    403
  );
  assert.equal(
    (
      await f.request('/api/admin/settings', {
        method: 'PUT',
        ...auth,
        origin: 'https://fora.example',
        body: change
      })
    ).status,
    403
  );
  assert.equal(
    (
      await f.request('/api/admin/settings', {
        method: 'PUT',
        ...auth,
        body: { ...change, retentionDays: 0 }
      })
    ).status,
    400
  );
  assert.equal(
    (await f.request('/api/admin/settings', { method: 'PUT', ...auth, body: change })).status,
    200
  );
  assert.deepEqual(await (await f.request('/api/admin/settings', auth)).json(), change);
  const privacy = await (await f.request('/api/privacy')).json();
  assert.equal(privacy.contactEmail, change.privacyEmail);
  assert.equal(privacy.notificationEmail, undefined);
});
test('salva uma vez e notifica sem dados do cliente; lista vem mascarada', async (t) => {
  const f = await fixture(t);
  const key = randomUUID();
  assert.equal((await f.submit(quote, key)).status, 201);
  assert.equal((await f.submit(quote, key)).status, 201);
  assert.equal(f.records.size, 1);
  assert.equal(f.messages.length, 1);
  assert.ok(!JSON.stringify(f.messages).includes(quote.email));
  assert.ok(!JSON.stringify(f.messages).includes(quote.message));
  const auth = await f.login();
  const list = await (await f.request('/api/admin/quotes', auth)).json();
  assert.equal(list.items[0].email, 'c***@example.com');
  assert.equal(list.items[0].quote, undefined);
  const detail = await (await f.request(`/api/admin/quotes/${list.items[0].id}`, auth)).json();
  assert.equal(detail.quote.message, quote.message);
  assert.ok(f.audits.some((item) => item.action === 'quote_view'));
});
test('SMTP indisponível mantém pedido salvo e permite nova notificação', async (t) => {
  const f = await fixture(t, { failSmtp: true });
  assert.equal((await f.submit()).status, 201);
  const [record] = f.records.values();
  assert.equal(record.notificationStatus, 'failed');
  const auth = await f.login();
  assert.equal(
    (await f.request(`/api/admin/quotes/${record.id}/notify`, { method: 'POST', ...auth })).status,
    502
  );
  assert.equal(f.records.size, 1);
});
test('falha de banco não envia e-mail nem vaza erro interno', async (t) => {
  const f = await fixture(t, { failDatabase: true });
  const res = await f.submit();
  assert.equal(res.status, 500);
  assert.ok(!(await res.text()).includes('segredo'));
  assert.equal(f.messages.length, 0);
});
test('ciência de privacidade, versão, campos e chave de envio são obrigatórios', async (t) => {
  const f = await fixture(t);
  for (const value of [
    { ...quote, privacyAccepted: false },
    { ...quote, noticeVersion: 'antiga' },
    { ...quote, email: 'a@b.com\r\nBcc: x@y.com' }
  ])
    assert.equal((await f.submit(value)).status, 400);
  assert.equal((await f.request('/api/orcamento', { method: 'POST', body: quote })).status, 400);
  assert.equal((await f.submit({ ...quote, website: 'spam' })).status, 200);
  assert.equal(f.records.size, 0);
});
test('exclusão exige CSRF e remove contato do banco ativo', async (t) => {
  const f = await fixture(t);
  await f.submit();
  const [record] = f.records.values();
  const auth = await f.login();
  const path = `/api/admin/quotes/${record.id}`;
  assert.equal((await f.request(path, { method: 'DELETE', cookie: auth.cookie })).status, 403);
  assert.equal((await f.request(path, { method: 'DELETE', ...auth })).status, 200);
  assert.equal((await f.request(path, auth)).status, 404);
  assert.equal(f.records.size, 0);
});
test('logout revoga sessão e inatividade impede reutilização', async (t) => {
  const f = await fixture(t);
  const auth = await f.login();
  await f.request('/api/admin/logout', { method: 'POST', ...auth });
  assert.equal((await f.request('/api/admin/settings', auth)).status, 401);
  const next = await f.login();
  f.advance(31 * 60 * 1000);
  assert.equal((await f.request('/api/admin/settings', next)).status, 401);
});
test('bloqueio de tentativas e JSON inválido retornam mensagens controladas', async (t) => {
  const f = await fixture(t);
  for (let attempt = 0; attempt < 10; attempt++)
    await f.request('/api/admin/login', { method: 'POST', body: {} });
  assert.equal((await f.request('/api/admin/login', { method: 'POST', body: {} })).status, 429);
  assert.equal((await f.request('/api/orcamento', { method: 'POST', raw: '{' })).status, 400);
});
test('sem banco, não simula recebimento e mantém site público disponível', async (t) => {
  const f = await fixture(t, { noDatabase: true });
  assert.equal((await f.submit()).status, 503);
  assert.equal((await f.request('/')).status, 200);
  const admin = await f.request('/admin');
  assert.equal(admin.status, 200);
  assert.equal(admin.headers.get('cache-control'), 'no-store');
  assert.equal((await f.request('/privacidade')).status, 200);
});
test('transporte Nodemailer gera aviso em texto puro sem contato do cliente', async () => {
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix'
  });
  const result = await transport.sendMail({
    from: 'site@example.com',
    to: 'admin@example.com',
    subject: 'Novo orçamento',
    text: 'Consulte o painel em https://site.example/admin'
  });
  assert.match(result.message.toString(), /Content-Type: text\/plain/);
  assert.ok(!result.message.toString().includes(quote.email));
  transport.close();
});
