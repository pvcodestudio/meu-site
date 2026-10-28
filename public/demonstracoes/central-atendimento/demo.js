/** Somente navegação entre exemplos. Não acessa dados ou serviços. */
(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];

  function showPanel(tab) {
    const target = tab.getAttribute('aria-controls');
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== target;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPanel(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      showPanel(tabs[next]);
      tabs[next].focus();
    });
  });
})();
