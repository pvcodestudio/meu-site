import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const page = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../public/js/main.js', import.meta.url), 'utf8');

function setup(t, reducedMotion = false) {
  const dom = new JSDOM(page, {
    url: 'http://localhost:3000',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  Object.defineProperty(window.document, 'readyState', {
    value: 'interactive',
    configurable: true
  });
  window.matchMedia = () => ({ matches: reducedMotion, addEventListener() {} });
  let clock = 0;
  let id = 0;
  const timers = new Map();
  window.setTimeout = (callback, delay) => {
    timers.set(++id, { callback, time: clock + delay });
    return id;
  };
  window.clearTimeout = (key) => timers.delete(key);
  window.eval(script);
  function advance(ms) {
    const end = clock + ms;
    while (true) {
      const next = [...timers]
        .filter(([, timer]) => timer.time <= end)
        .sort((a, b) => a[1].time - b[1].time)[0];
      if (!next) break;
      clock = next[1].time;
      timers.delete(next[0]);
      next[1].callback();
    }
    clock = end;
  }
  return { window, loader: window.document.querySelector('.site-loader'), advance };
}

test('Matrix cobre a abertura e aguarda os recursos da pagina carregarem', (t) => {
  const { window, loader, advance } = setup(t);
  assert.ok(loader.classList.contains('is-loading'));
  assert.ok(loader.querySelectorAll('.digit').length > 100);
  advance(3000);
  assert.ok(loader.classList.contains('is-loading'), 'nao deve sair antes de load');
  window.dispatchEvent(new window.Event('load'));
  advance(500);
  assert.equal(loader.isConnected, false);
});

test('Matrix permanece por um ciclo visivel mesmo se o carregamento for rapido', (t) => {
  const { window, loader, advance } = setup(t);
  window.dispatchEvent(new window.Event('load'));
  advance(1000);
  assert.ok(loader.classList.contains('is-loading'));
  advance(1700);
  assert.equal(loader.isConnected, false);
});

test('abertura solicitada aparece também com movimento reduzido e pode ser dispensada', (t) => {
  const { window, loader, advance } = setup(t, true);
  assert.ok(loader?.classList.contains('is-loading'));
  window.dispatchEvent(new window.Event('pointerdown'));
  advance(500);
  assert.equal(window.document.querySelector('.site-loader'), null);
});

test('Matrix libera o site mesmo se algum recurso nao terminar de carregar', (t) => {
  const { loader, advance } = setup(t);
  advance(8500);
  assert.equal(loader.isConnected, false);
});
