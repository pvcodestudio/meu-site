/** O terceiro projeto deve abrir uma apresentação visual, sem coletar dados. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createApp } from '../server/app.js';
import { readConfig } from '../server/config.js';
import { readFile } from 'node:fs/promises';

test('projeto de advocacia abre a demonstração com recursos locais e sem ações reais', async (t) => {
  const app = createApp({
    config: readConfig({ APP_ORIGIN: 'http://localhost:3000' }),
    repository: null,
    mailer: null
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      })
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const home = new JSDOM(await (await fetch(origin)).text());
  t.after(() => home.window.close());
  const cards = home.window.document.querySelectorAll('.project-card');
  assert.equal(cards.length, 3);
  assert.equal(
    cards[0].querySelector('.project-link').getAttribute('href'),
    '/demonstracoes/don-marco/'
  );
  assert.equal(
    cards[1].querySelector('.project-link').getAttribute('href'),
    '/demonstracoes/central-atendimento/'
  );
  const card = cards[2];
  const url = new URL(card.querySelector('.project-link').getAttribute('href'), origin);
  assert.equal(url.pathname, '/demonstracoes/advocacia/');
  for (const link of card.querySelectorAll('a'))
    assert.equal(link.getAttribute('href'), url.pathname);
  assert.equal(
    (await fetch(new URL(card.querySelector('img').getAttribute('src'), origin))).status,
    200
  );

  const response = await fetch(url);
  assert.equal(response.status, 200);
  const dom = new JSDOM(await response.text(), { url: url.href });
  t.after(() => dom.window.close());
  const doc = dom.window.document;
  assert.match(doc.querySelector('.demo-banner').textContent, /demonstração visual/i);
  assert.match(doc.querySelector('h1').textContent, /clareza e/);
  assert.ok(doc.querySelector('#areas'));
  assert.ok(doc.querySelector('#escritorio'));
  assert.ok(doc.querySelector('details.demo-mobile-nav nav a[href="#areas"]'));
  assert.equal(doc.querySelectorAll('script, form, input, textarea, select, iframe').length, 0);
  assert.equal(doc.querySelectorAll('[role="button"], [data-open-modal]').length, 0);
  assert.ok([...doc.querySelectorAll('button')].every((button) => button.disabled));
  assert.ok(doc.querySelector('a[href="/#projetos"]'));
  assert.equal(
    doc.querySelectorAll('a[href^="http"], a[href^="tel:"], a[href^="mailto:"], [onclick]').length,
    0
  );
  assert.equal(doc.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
  for (const link of doc.querySelectorAll('a[href^="#"]')) {
    assert.ok(doc.getElementById(link.hash.slice(1)), `Âncora inexistente: ${link.hash}`);
  }
  for (const element of doc.querySelectorAll('link[href], img[src]')) {
    const resource = new URL(element.getAttribute('src') || element.getAttribute('href'), url);
    assert.equal(resource.origin, origin);
    const result = await fetch(resource);
    assert.equal(result.status, 200, resource.href);
    if (resource.pathname.endsWith('.css')) {
      for (const match of (await result.text()).matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
        if (match[1].startsWith('data:')) continue;
        const asset = new URL(match[1], resource);
        assert.equal(asset.origin, origin);
        assert.equal((await fetch(asset)).status, 200, asset.href);
      }
    }
  }
  assert.equal((await fetch(new URL('assets/js/main.js', url))).status, 404);
});

test('menu da demonstração permanece disponível em celular sem disputar espaço com agendamento', async () => {
  const base = new URL('../public/demonstracoes/advocacia/', import.meta.url);
  const html = await readFile(new URL('index.html', base), 'utf8');
  const styles = await Promise.all(
    ['fonts.css', 'style.css', 'animations.css', 'demonstracao.css'].map((name) =>
      readFile(new URL(`assets/css/${name}`, base), 'utf8')
    )
  );
  const parser = new JSDOM(`<style>${styles.join('\n')}</style>`);
  try {
    for (const width of [320, 390, 768, 1280]) {
      const flatten = (rules) =>
        [...rules].flatMap((rule) => {
          if (rule.type !== 4) return [rule.cssText];
          if (rule.conditionText.includes('prefers-reduced-motion')) return [];
          const active = [...rule.conditionText.matchAll(/(max|min)-width:\s*(\d+)px/g)].every(
            ([, mode, value]) => (mode === 'max' ? width <= Number(value) : width >= Number(value))
          );
          return active ? flatten(rule.cssRules) : [];
        });
      const dom = new JSDOM(html);
      try {
        const style = dom.window.document.createElement('style');
        style.textContent = flatten(parser.window.document.styleSheets[0].cssRules).join('\n');
        dom.window.document.head.append(style);
        const display = (selector) =>
          dom.window.getComputedStyle(dom.window.document.querySelector(selector)).display;
        assert.equal(
          display('.demo-mobile-nav'),
          width <= 860 ? 'block' : 'none',
          `${width}px menu`
        );
        if (width <= 860) assert.equal(display('.header-action'), 'none', `${width}px header`);
        else assert.notEqual(display('.header-action'), 'none');
      } finally {
        dom.window.close();
      }
    }
  } finally {
    parser.window.close();
  }
});
