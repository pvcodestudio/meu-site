/** A demonstração apresenta o layout completo sem executar o agendamento original. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createApp } from '../server/app.js';
import { readConfig } from '../server/config.js';

test('portfólio abre a demonstração estática da Don Marco com todos os recursos locais', async (t) => {
  const config = readConfig({ APP_ORIGIN: 'http://localhost:3000' });
  const app = createApp({ config, repository: null, mailer: null });
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
  const link = home.window.document.querySelector('.project-card .project-link');
  assert.equal(link.getAttribute('href'), '/demonstracoes/don-marco/');

  const url = new URL(link.getAttribute('href'), origin);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const dom = new JSDOM(await response.text(), { url: url.href });
  t.after(() => dom.window.close());
  const doc = dom.window.document;
  assert.match(doc.querySelector('.demo-banner').textContent, /demonstração visual/i);
  const presentation = doc.getElementById('inicio');
  assert.ok(
    presentation?.classList.contains('home-page'),
    'a demonstração deve usar a página inicial do RAR correto'
  );
  assert.equal(presentation.hidden, false);
  assert.match(doc.getElementById('homeTitle').textContent, /Seu corte, do jeito que você gosta/);
  assert.equal(doc.querySelectorAll('#catalogList .catalog-card').length, 4);
  assert.equal(doc.getElementById('catalogo-servicos').hidden, false);
  assert.equal(doc.querySelectorAll('#avaliacoes .experience-shot').length, 3);
  assert.equal(doc.getElementById('informacoes').hidden, false);
  assert.equal(doc.querySelectorAll('#servicesList .service-card').length, 4);
  assert.equal(doc.querySelectorAll('#barbersList .barber-card').length, 4);
  assert.equal(doc.querySelectorAll('#datesList .date-pill').length, 7);
  assert.equal(doc.querySelectorAll('#timeSlots .time-slot').length, 10);
  assert.match(doc.querySelector('#summaryCard').textContent, /Corte de cabelo/);
  assert.match(doc.querySelector('#mobileSummary').textContent, /Corte de cabelo/);
  assert.equal(doc.querySelectorAll('script, form').length, 0);
  assert.equal(doc.querySelectorAll('dialog, iframe').length, 0);
  assert.ok(doc.querySelectorAll('button').length > 0);
  assert.ok([...doc.querySelectorAll('button')].every((button) => button.disabled));
  assert.ok(doc.querySelector('a[href="/#projetos"]'));
  const ids = [...doc.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(ids.length, new Set(ids).size, 'os resumos devem ter títulos distintos');

  const resources = new Set();
  for (const element of doc.querySelectorAll('link[href], img[src], use[href]')) {
    const value = element.getAttribute('src') || element.getAttribute('href');
    const resource = new URL(value, url);
    assert.equal(resource.origin, origin, 'a demonstração deve usar recursos locais');
    resource.hash = '';
    resources.add(resource.href);
  }
  for (const resource of resources) {
    const result = await fetch(resource);
    assert.equal(result.status, 200, resource);
    if (new URL(resource).pathname.endsWith('.css')) {
      const css = await result.text();
      for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
        if (match[1].startsWith('data:')) continue;
        const asset = new URL(match[1], resource);
        assert.equal(asset.origin, origin);
        assert.equal((await fetch(asset)).status, 200, asset.href);
      }
    }
  }
  for (const anchor of doc.querySelectorAll('a[href^="#"]')) {
    assert.ok(doc.getElementById(anchor.hash.slice(1)), `destino ausente: ${anchor.hash}`);
  }
  assert.equal((await fetch(new URL('assets/js/agendamento.js', url))).status, 404);
  for (const privatePath of ['.env', '.local/chave.key', 'backend/server.js', 'admin.html']) {
    assert.equal((await fetch(new URL(privatePath, url))).status, 404);
  }
});
