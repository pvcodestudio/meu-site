/** O aviso só apresenta um prazo de retenção depois de consultar a configuração. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const page = await readFile(new URL('../server/views/privacy.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../public/js/privacy.js', import.meta.url), 'utf8');

function setup(t, fetch) {
  const dom = new JSDOM(page, {
    url: 'http://localhost:3000/privacidade',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  dom.window.fetch = fetch;
  return { document: dom.window.document, ready: dom.window.eval(script) };
}

test('aviso não afirma um prazo enquanto a configuração está pendente', (t) => {
  const { document } = setup(t, () => new Promise(() => {}));
  assert.doesNotMatch(document.getElementById('retention-days').textContent, /\d/);
});

test('aviso apresenta o prazo configurado e o contato público retornado pela API', async (t) => {
  const { document, ready } = setup(t, async () => ({
    ok: true,
    json: async () => ({
      retentionDays: 45,
      contactEmail: 'dados@example.com',
      noticeVersion: '2026-10-21'
    })
  }));
  await ready;
  assert.equal(document.getElementById('retention-days').textContent, '45 dias');
  assert.equal(document.querySelector('#privacy-contact a').href, 'mailto:dados@example.com');
});

for (const failure of ['rede', 'servidor']) {
  test(`aviso informa prazo indisponível quando há falha de ${failure}`, async (t) => {
    const { document, ready } = setup(t, async () => {
      if (failure === 'rede') throw new TypeError('conexão indisponível');
      return { ok: false, status: 503 };
    });
    await ready;
    assert.match(document.getElementById('retention-days').textContent, /indisponível/i);
    assert.doesNotMatch(document.getElementById('retention-days').textContent, /\d/);
    assert.equal(document.querySelector('#privacy-contact a'), null);
  });
}
