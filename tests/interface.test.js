/** Interações DOM; não substitui inspeção visual. Pedro Vitor — PVcoding Studio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../server/views/admin.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../public/js/admin.js', import.meta.url), 'utf8');
async function waitFor(predicate) {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.fail('A interface não atingiu o estado esperado.');
}

test('painel permite login e configuração; mensagens de clientes entram como texto', async (t) => {
  const dom = new JSDOM(html, { url: 'https://studio.example/admin', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const document = window.document;
  let authenticated = false;
  const requests = [];
  const attack = '<img src=x onerror="alert(1)">';
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new window.Event('close'));
  };
  const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  window.fetch = async (url, options = {}) => {
    requests.push({ url, ...options });
    if (url === '/api/admin/session')
      return {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Entre novamente para continuar.' })
      };
    if (url === '/api/admin/login') {
      authenticated = true;
      return { ok: true, json: async () => ({ csrfToken: 'token-de-teste' }) };
    }
    if (!authenticated)
      return { ok: false, status: 401, json: async () => ({ message: 'Sessão encerrada.' }) };
    let result;
    if (url === '/api/admin/settings')
      result =
        options.method === 'PUT'
          ? { message: 'Configurações salvas.' }
          : {
              notificationEmail: 'admin@example.com',
              privacyEmail: 'dados@example.com',
              retentionDays: 90
            };
    if (url.startsWith('/api/admin/quotes?'))
      result = {
        items: [
          {
            id,
            name: 'C***',
            email: 'c***@example.com',
            projectType: attack,
            createdAt: new Date().toISOString(),
            notificationStatus: 'sent'
          }
        ]
      };
    if (url === `/api/admin/quotes/${id}`)
      result = { quote: { name: 'Cliente', email: 'cliente@example.com', message: attack } };
    return { ok: true, json: async () => result };
  };
  window.eval(script);
  await waitFor(() => requests.some((item) => item.url.endsWith('/session')));
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(document.getElementById('dashboard').hidden, true);
  document.getElementById('username').value = 'admin';
  document.getElementById('password').value = 'sintetica';
  function submit(id) {
    const form = document.getElementById(id);
    form.dispatchEvent(
      new window.SubmitEvent('submit', {
        bubbles: true,
        cancelable: true,
        submitter: form.querySelector('[type=submit]')
      })
    );
  }
  submit('login-form');
  await waitFor(() => !document.getElementById('dashboard').hidden);
  assert.equal(document.getElementById('password').value, '');
  document.getElementById('notificationEmail').value = 'novo@example.com';
  submit('settings-form');
  await waitFor(() => requests.some((item) => item.method === 'PUT'));
  const update = requests.find((item) => item.method === 'PUT');
  assert.equal(update.headers['X-CSRF-Token'], 'token-de-teste');
  assert.equal(JSON.parse(update.body).notificationEmail, 'novo@example.com');
  document.getElementById('quotes-tab').click();
  await waitFor(() => document.querySelector('#quotes-list button'));
  assert.ok(document.getElementById('quotes-list').textContent.includes(attack));
  assert.equal(document.querySelector('#quotes-list img'), null);
  document.querySelector('#quotes-list button').click();
  await waitFor(() => document.getElementById('quote-dialog').open);
  assert.ok(document.getElementById('quote-details').textContent.includes(attack));
  assert.equal(document.querySelector('#quote-details img'), null);
  document.getElementById('close-dialog').click();
  assert.equal(document.getElementById('quote-details').textContent, '');
  authenticated = false;
  document.getElementById('refresh').click();
  await waitFor(() => document.getElementById('dashboard').hidden);
  assert.equal(document.getElementById('quotes-list').textContent, '');
  assert.equal(window.localStorage.length, 0);
});

test('formulário público exige ciência e mantém os campos originais', async (t) => {
  const page = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(page);
  t.after(() => dom.window.close());
  const document = dom.window.document;
  for (const id of ['name', 'email', 'phone', 'projectType', 'budget', 'message', 'quote-form'])
    assert.ok(document.getElementById(id));
  const checkbox = document.getElementById('privacyAccepted');
  assert.equal(checkbox.required, true);
  assert.equal(checkbox.checked, false);
  assert.equal(checkbox.checkValidity(), false);
  assert.ok(document.querySelector('a[href="/privacidade"]'));
  assert.ok(document.querySelector('a[href="/admin"]'));
});
