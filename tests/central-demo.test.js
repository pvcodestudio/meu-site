/** A apresentação da Central usa somente dados fictícios e interações de visualização. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createApp } from '../server/app.js';
import { readConfig } from '../server/config.js';

test('portfólio oferece a Central fictícia sem logos, arquivos ou serviços do sistema original', async (t) => {
  const app = createApp({ config: readConfig({}), repository: null, mailer: null });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      })
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const home = new JSDOM(await (await fetch(origin)).text());
  t.after(() => home.window.close());
  const project = [...home.window.document.querySelectorAll('.project-card')].find(
    (card) => card.querySelector('h3').textContent === 'Central de Atendimento'
  );
  assert.equal(
    project.querySelector('.project-link').getAttribute('href'),
    '/demonstracoes/central-atendimento/'
  );
  assert.equal(
    project.querySelector('img').getAttribute('src'),
    '/assets/projetos/central-demonstracao.svg'
  );
  const url = new URL('/demonstracoes/central-atendimento/', origin);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const dom = new JSDOM(await response.text(), { url: url.href });
  t.after(() => dom.window.close());
  const doc = dom.window.document;
  assert.match(doc.querySelector('.demo-banner').textContent, /fictícios/i);
  assert.match(doc.getElementById('brandCompanyName').textContent, /Nexo/);
  assert.equal(doc.querySelectorAll('script').length, 1);
  assert.equal(
    new URL(doc.querySelector('script').getAttribute('src'), url).pathname,
    '/demonstracoes/central-atendimento/demo.js'
  );
  assert.equal(doc.querySelectorAll('form, iframe, [type=password], [type=file]').length, 0);
  assert.equal(doc.querySelectorAll('[role=tab]').length, 10);
  assert.equal(doc.querySelectorAll('[role=tabpanel]').length, 10);
  assert.ok(doc.querySelectorAll('.card-text').length >= 12);
  for (const button of doc.querySelectorAll('[data-demo-action]'))
    assert.equal(button.disabled, true);
  for (const field of doc.querySelectorAll('input:not([type=checkbox]), textarea'))
    assert.ok(field.readOnly || field.disabled);
  const ids = [...doc.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const element of doc.querySelectorAll('link[href], script[src], img[src]')) {
    const resource = new URL(element.getAttribute('src') || element.getAttribute('href'), url);
    assert.equal(resource.origin, origin);
    assert.equal((await fetch(resource)).status, 200, resource.href);
  }
  for (const privatePath of [
    'app.js',
    'branding.js',
    'persistence.js',
    'email.js',
    'sw.js',
    'logo.png',
    'manifest.json',
    '.env'
  ]) {
    assert.equal((await fetch(new URL(privatePath, url))).status, 404, privatePath);
  }
  assert.equal((await fetch(`${origin}/assets/projetos/central-atendimento.png`)).status, 404);
});

test('abas preservam o tema escuro, sem rede, armazenamento ou ações reais', async (t) => {
  const html = await readFile(
    new URL('../public/demonstracoes/central-atendimento/index.html', import.meta.url),
    'utf8'
  );
  const script = await readFile(
    new URL('../public/demonstracoes/central-atendimento/demo.js', import.meta.url),
    'utf8'
  );
  const dom = new JSDOM(html, {
    url: 'http://localhost/demonstracoes/central-atendimento/',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.fetch = () => assert.fail('a apresentação não deve acessar serviços');
  for (const key of ['localStorage', 'sessionStorage'])
    Object.defineProperty(window, key, {
      get() {
        assert.fail('a apresentação não deve acessar dados salvos');
      }
    });
  window.eval(script);
  const doc = window.document;
  assert.equal(doc.body.classList.contains('dark'), true);
  assert.equal(doc.getElementById('demo-theme'), null);
  const tabs = [...doc.querySelectorAll('[role=tab]')];
  for (const tab of tabs) {
    tab.click();
    assert.equal(tab.getAttribute('aria-selected'), 'true');
    assert.equal(doc.getElementById(tab.getAttribute('aria-controls')).hidden, false);
    assert.equal(doc.querySelectorAll('[role=tabpanel]:not([hidden])').length, 1);
  }
  tabs[0].focus();
  tabs[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(doc.activeElement, tabs[1]);
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(doc.body.classList.contains('dark'), true);
});
