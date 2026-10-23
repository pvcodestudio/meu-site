import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuote, renderQuoteEmail } from '../server/validation.js';

const goodData = {
  name: 'Cliente Exemplo', email: 'cliente@exemplo.com',
  phone: '11987654321', projectType: 'Sistema web',
  budget: 'R$ 3.000 a R$ 6.000', message: 'Preciso organizar o atendimento da empresa.', website: ''
};
test('aceita um orçamento preenchido corretamente', () => {
  assert.deepEqual(validateQuote(goodData), goodData);
});
test('remove espaços desnecessários', () => {
  assert.equal(validateQuote({ ...goodData, name: '  Maria  ' }).name, 'Maria');
});
test('rejeita e-mail incorreto', () => {
  assert.equal(validateQuote({ ...goodData, email: 'nao-e-email' }), null);
});
test('rejeita opções não cadastradas', () => {
  assert.equal(validateQuote({ ...goodData, projectType: 'Outra opção' }), null);
  assert.equal(validateQuote({ ...goodData, budget: 'R$ 100.000.000' }), null);
});
test('rejeita mensagens vazias, curtas ou longas', () => {
  assert.equal(validateQuote({ ...goodData, message: 'Olá' }), null);
  assert.equal(validateQuote({ ...goodData, message: 'x'.repeat(3001) }), null);
});
test('rejeita formato inválido', () => {
  assert.equal(validateQuote(null), null);
  assert.equal(validateQuote([]), null);
});
test('gera mensagem de texto com os dados corretos', () => {
  const body = renderQuoteEmail(goodData);
  assert.match(body, /Cliente Exemplo/);
  assert.match(body, /Preciso organizar o atendimento/);
});
test('mantém conteúdo inserido como texto sem interpretar HTML', () => {
  const body = renderQuoteEmail({ ...goodData, message: 'Preciso de site <script>alert(1)</script>' });
  assert.match(body, /<script>/);
  assert.doesNotMatch(body, /<html>/);
});
