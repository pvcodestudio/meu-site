/** Interações do painel. Autor: Pedro Vitor — PVcoding Studio. */
(() => {
  'use strict';
  const el = (id) => document.getElementById(id);
  let csrfToken = '';
  let page = 1;
  let selectedId = '';
  let idleTimer;
  function status(message, error = false) {
    el('admin-status').textContent = message;
    el('admin-status').dataset.error = String(error);
    el('dialog-status').textContent = el('quote-dialog').open ? message : '';
  }
  function signedOut() {
    window.clearTimeout(idleTimer);
    csrfToken = '';
    el('dashboard').hidden = true;
    el('logout').hidden = true;
    el('login-panel').hidden = false;
    el('quotes-list').replaceChildren();
    el('quote-details').replaceChildren();
    el('settings-form').reset();
    el('quote-dialog').close();
    selectedId = '';
  }
  async function api(path, method = 'GET', body) {
    const response = await fetch(`/api/admin${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        ...(method !== 'GET'
          ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
          : {})
      },
      ...(body !== undefined
        ? { body: JSON.stringify(body) }
        : method !== 'GET'
          ? { body: '{}' }
          : {})
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) signedOut();
      throw new Error(result.message || 'Não foi possível concluir a operação.');
    }
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(
      () => {
        signedOut();
        status('Sessão encerrada por inatividade.');
      },
      30 * 60 * 1000
    );
    return result;
  }
  async function run(button, action) {
    button.disabled = true;
    try {
      await action();
    } catch (error) {
      status(error.message, true);
    } finally {
      button.disabled = false;
    }
  }
  async function showDashboard() {
    const settings = await api('/settings');
    for (const key of ['notificationEmail', 'privacyEmail', 'retentionDays'])
      el(key).value = settings[key];
    el('login-panel').hidden = true;
    el('dashboard').hidden = false;
    el('logout').hidden = false;
    const id = location.hash.slice(1);
    if (/^[a-f0-9-]{36}$/.test(id)) {
      selectPanel('quotes');
      await loadQuotes();
      await openQuote(id);
    }
  }
  function selectPanel(name) {
    for (const tab of ['settings', 'quotes']) {
      el(`${tab}-panel`).hidden = tab !== name;
      el(`${tab}-tab`).setAttribute('aria-pressed', String(tab === name));
    }
  }
  async function loadQuotes() {
    const result = await api(`/quotes?page=${page}`);
    const list = el('quotes-list');
    list.replaceChildren();
    if (!result.items.length) {
      const item = document.createElement('li');
      item.textContent = 'Nenhuma solicitação nesta página.';
      list.append(item);
    }
    for (const item of result.items) {
      const row = document.createElement('li');
      const summary = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = item.projectType;
      const contact = document.createElement('span');
      contact.textContent = `${item.name} · ${item.email}`;
      const date = document.createElement('span');
      date.textContent = `${new Date(item.createdAt).toLocaleString('pt-BR')} · Notificação ${item.notificationStatus === 'sent' ? 'enviada' : 'pendente'}`;
      summary.append(title, contact, date);
      const button = document.createElement('button');
      button.textContent = 'Ver detalhes';
      button.setAttribute(
        'aria-label',
        `Ver solicitação de ${item.projectType}, recebida em ${new Date(item.createdAt).toLocaleString('pt-BR')}`
      );
      button.addEventListener('click', () => run(button, () => openQuote(item.id)));
      row.append(summary, button);
      list.append(row);
    }
    el('page-label').textContent = `Página ${page}`;
    el('previous').disabled = page === 1;
    el('next').disabled = result.items.length < 20;
  }
  async function openQuote(id) {
    el('dialog-status').textContent = '';
    const item = await api(`/quotes/${id}`);
    selectedId = id;
    const details = el('quote-details');
    details.replaceChildren();
    const labels = {
      name: 'Nome',
      email: 'E-mail',
      phone: 'WhatsApp',
      projectType: 'Projeto',
      budget: 'Investimento',
      message: 'Mensagem'
    };
    for (const [key, label] of Object.entries(labels)) {
      const term = document.createElement('dt');
      term.textContent = label;
      const value = document.createElement('dd');
      value.textContent = item.quote[key] || 'Não informado';
      details.append(term, value);
    }
    el('quote-dialog').showModal();
  }
  el('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    run(event.submitter, async () => {
      const credentials = { username: el('username').value.trim(), password: el('password').value };
      el('password').value = '';
      const session = await api('/login', 'POST', credentials);
      csrfToken = session.csrfToken;
      await showDashboard();
      status('Acesso autorizado.');
    });
  });
  el('logout').addEventListener('click', (event) =>
    run(event.currentTarget, async () => {
      await api('/logout', 'POST');
      signedOut();
      status('Sessão encerrada.');
    })
  );
  el('settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    run(event.submitter, async () => {
      const result = await api('/settings', 'PUT', {
        notificationEmail: el('notificationEmail').value.trim(),
        privacyEmail: el('privacyEmail').value.trim(),
        retentionDays: Number(el('retentionDays').value)
      });
      status(result.message);
    });
  });
  el('settings-tab').addEventListener('click', () => selectPanel('settings'));
  el('quotes-tab').addEventListener('click', (event) =>
    run(event.currentTarget, async () => {
      selectPanel('quotes');
      await loadQuotes();
    })
  );
  el('refresh').addEventListener('click', (event) => run(event.currentTarget, loadQuotes));
  el('previous').addEventListener('click', async () => {
    if (page > 1) {
      page -= 1;
      try {
        await loadQuotes();
      } catch (error) {
        status(error.message, true);
      }
    }
  });
  el('next').addEventListener('click', async () => {
    page += 1;
    try {
      await loadQuotes();
    } catch (error) {
      status(error.message, true);
    }
  });
  el('close-dialog').addEventListener('click', () => el('quote-dialog').close());
  el('quote-dialog').addEventListener('close', () => {
    el('quote-details').replaceChildren();
    selectedId = '';
    history.replaceState(null, '', location.pathname);
  });
  el('delete-quote').addEventListener('click', (event) =>
    run(event.currentTarget, async () => {
      if (
        !window.confirm(
          'Excluir esta solicitação do banco ativo? Esta ação não pode ser desfeita pelo painel.'
        )
      )
        return;
      const result = await api(`/quotes/${selectedId}`, 'DELETE');
      el('quote-dialog').close();
      status(result.message);
      await loadQuotes();
    })
  );
  el('retry-notification').addEventListener('click', (event) =>
    run(event.currentTarget, async () => {
      const result = await api(`/quotes/${selectedId}/notify`, 'POST');
      status(result.message);
    })
  );
  // Não persistir tokens ou dados pessoais em localStorage/sessionStorage.
  window.addEventListener('pagehide', signedOut);
  api('/session')
    .then(async (session) => {
      csrfToken = session.csrfToken;
      await showDashboard();
    })
    .catch((error) => {
      signedOut();
      if (!error.message.includes('Entre novamente')) status(error.message, true);
    });
})();
