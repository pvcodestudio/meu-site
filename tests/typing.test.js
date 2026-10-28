import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const page = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../public/js/main.js', import.meta.url), 'utf8');

function setup(t, reducedMotion = false, automaticMotion = false) {
  const dom = new JSDOM(page, {
    url: 'http://localhost:3000',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  const motionListeners = [];
  const motionPreference = {
    matches: reducedMotion,
    addEventListener(_event, listener) {
      motionListeners.push(listener);
    }
  };
  window.matchMedia = (query) =>
    query.includes('prefers-reduced-motion')
      ? motionPreference
      : { matches: false, addEventListener() {} };
  let now = 0;
  let id = 0;
  const timers = new Map();
  window.setTimeout = (callback, delay) => {
    timers.set(++id, { callback, time: now + delay });
    return id;
  };
  window.clearTimeout = (key) => timers.delete(key);
  const code = window.document.querySelector('.editor-code');
  if (automaticMotion) code.removeAttribute('data-typing');
  const original = [...code.children].slice(0, -1).map((line) => line.textContent);
  const coloredSpans = code.querySelectorAll('span').length;
  window.eval(script);
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers]
        .filter(([, timer]) => timer.time <= end)
        .sort((a, b) => a[1].time - b[1].time)[0];
      if (!next) break;
      now = next[1].time;
      timers.delete(next[0]);
      next[1].callback();
    }
    now = end;
  }
  function setReducedMotion(matches) {
    motionPreference.matches = matches;
    motionListeners.forEach((listener) => listener({ matches }));
  }
  return { window, code, original, coloredSpans, advance, setReducedMotion };
}

test('editor digita logo apos dispensar a abertura e preserva as cores', (t) => {
  const { window, code, original, coloredSpans, advance } = setup(t);
  advance(200);
  assert.equal(code.children[0].textContent, '');
  window.dispatchEvent(new window.Event('pointerdown'));
  advance(500);
  const partial = code.children[0].textContent;
  assert.ok(
    partial.length > 0 && partial.length < original[0].length,
    'deve comecar a digitar assim que a abertura sair'
  );
  assert.ok(code.querySelector('.is-typing'));
  advance(1600);
  assert.equal(code.children[0].textContent, original[0]);
  assert.equal(code.querySelectorAll('span').length, coloredSpans);
  let completed = false;
  let restarted = false;
  for (let elapsed = 0; elapsed < 40000; elapsed += 100) {
    advance(100);
    const complete = [...code.children]
      .slice(0, -1)
      .every((line, index) => line.textContent === original[index]);
    if (completed && !complete) {
      restarted = true;
      break;
    }
    completed ||= complete;
  }
  assert.ok(completed, 'todas as linhas devem ser digitadas');
  assert.ok(restarted, 'a digitação deve recomeçar após a pausa original');
  assert.equal(code.querySelectorAll('.is-typing').length, 1);
  assert.equal(code.classList.contains('is-animating'), true);
});

test('editor mantém a digitação solicitada mesmo com movimento reduzido', (t) => {
  const { window, code, original, advance } = setup(t, true);
  window.dispatchEvent(new window.Event('pointerdown'));
  advance(500);
  assert.equal(code.classList.contains('is-animating'), true);
  assert.ok(code.children[0].textContent.length > 0);
  assert.ok(code.children[0].textContent.length < original[0].length);
  assert.equal(code.children[1].textContent, '');
});

test('modo automatico respeita movimento reduzido', (t) => {
  const { code, original, advance } = setup(t, true, true);
  advance(30000);
  assert.deepEqual(
    [...code.children].slice(0, -1).map((line) => line.textContent),
    original
  );
  assert.equal(code.classList.contains('is-animating'), false);
});

test('mudar a preferência durante a digitação restaura o código e encerra os timers', (t) => {
  const { window, code, original, advance, setReducedMotion } = setup(t, false, true);
  window.dispatchEvent(new window.Event('pointerdown'));
  advance(500);
  assert.ok(code.querySelector('.is-typing'));
  setReducedMotion(true);
  advance(30000);
  assert.equal(code.querySelector('.is-typing'), null);
  assert.equal(code.classList.contains('is-animating'), false);
  assert.deepEqual(
    [...code.children].slice(0, -1).map((line) => line.textContent),
    original
  );
});
