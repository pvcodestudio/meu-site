/** Regras do formulário. Autor: Pedro Vitor — PVcoding Studio. */
export const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i.test(value.trim());
const TYPE_OPTIONS = ['Site institucional', 'Landing page', 'Sistema web', 'Outro'];
const BUDGET_OPTIONS = ['', 'Até R$ 1.500', 'R$ 1.500 a R$ 3.000', 'R$ 3.000 a R$ 6.000', 'Acima de R$ 6.000'];

export function validateQuote(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const get = key => typeof data[key] === 'string' ? data[key].trim() : '';
  const quote = {
    name: get('name'), email: get('email'), phone: get('phone'),
    projectType: get('projectType'), budget: get('budget'),
    message: get('message'), website: get('website')
  };

  if (quote.name.length < 2 || quote.name.length > 100) return null;
  if (!validEmail(quote.email)) return null;
  if (quote.phone.length > 30) return null;
  if (!TYPE_OPTIONS.includes(quote.projectType)) return null;
  if (!BUDGET_OPTIONS.includes(quote.budget)) return null;
  if (quote.message.length < 15 || quote.message.length > 3000) return null;
  if (quote.website.length > 100) return null;
  return quote;
}

export function renderQuoteEmail(quote) {
  // Corpo texto puro: nunca renderizar HTML fornecido por visitantes.
  const safe = value => value || 'Não informado';
  return [
    'Nova solicitação de orçamento • PVcoding Studio', '',
    `Nome: ${quote.name}`, `E-mail: ${quote.email}`,
    `WhatsApp: ${safe(quote.phone)}`, `Tipo de projeto: ${quote.projectType}`,
    `Investimento: ${safe(quote.budget)}`, '',
    'Descrição do projeto:', quote.message, '',
    'Mensagem enviada pelo formulário do site.'
  ].join('\n');
}
