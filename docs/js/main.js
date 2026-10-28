/**
 * Pedro Vitor — PVcoding Studio | Interações da página
 * Sem bibliotecas no navegador. Cada função tem uma responsabilidade simples.
 */
(() => {
  'use strict';

  // A abertura Matrix é parte da identidade escolhida pelo autor.
  const siteLoader = document.querySelector('.site-loader');
  if (
    siteLoader &&
    (siteLoader.dataset.matrix === 'always' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    const matrix = siteLoader.querySelector('.ai-matrix-loader');
    const digits = document.createDocumentFragment();
    const digitCount = Math.min(
      2400,
      Math.max(1, Math.floor(window.innerWidth / 48)) * Math.ceil(window.innerHeight / 64)
    );
    for (let index = 0; index < digitCount; index += 1) {
      const digit = document.createElement('span');
      digit.className = 'digit';
      digit.textContent = Math.random() < 0.5 ? '0' : '1';
      digits.append(digit);
    }
    matrix.querySelectorAll('.digit').forEach((digit) => digit.remove());
    matrix.prepend(digits);
    siteLoader.classList.add('is-loading');
    let dismissed = false;
    let minimumElapsed = false;
    let pageLoaded = document.readyState === 'complete';
    let minimumTimer;
    let safetyTimer;
    const dismissLoader = () => {
      if (dismissed) return;
      dismissed = true;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(safetyTimer);
      siteLoader.classList.remove('is-loading');
      window.removeEventListener('load', onPageLoad);
      window.removeEventListener('keydown', dismissLoader);
      window.removeEventListener('pointerdown', dismissLoader);
      window.setTimeout(() => siteLoader.remove(), 450);
    };
    const finishWhenReady = () => {
      if (minimumElapsed && pageLoaded) dismissLoader();
    };
    const onPageLoad = () => {
      pageLoaded = true;
      finishWhenReady();
    };
    // Um ciclo completo torna o efeito visivel em conexoes rapidas.
    minimumTimer = window.setTimeout(() => {
      minimumElapsed = true;
      finishWhenReady();
    }, 2200);
    // Um recurso travado nao pode prender a abertura indefinidamente.
    safetyTimer = window.setTimeout(dismissLoader, 8000);
    if (!pageLoaded) window.addEventListener('load', onPageLoad, { once: true });
    window.addEventListener('keydown', dismissLoader, { once: true });
    window.addEventListener('pointerdown', dismissLoader, { once: true });
  } else {
    siteLoader?.remove();
  }

  // Digita os nós de texto existentes, preservando as cores e a marcação do editor.
  const editorCode = document.querySelector('.editor-code');
  if (editorCode) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const codeLines = [...editorCode.children].filter(
      (line) => !line.classList.contains('editor-caret')
    );
    const codeNodes = codeLines.map((line) => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode())
        nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
      return nodes;
    });
    let typingTimer;
    let lineIndex = 0;
    let characterIndex = 0;
    let editorVisible = !('IntersectionObserver' in window);
    if ('IntersectionObserver' in window) {
      const editorObserver = new IntersectionObserver((entries) => {
        editorVisible = entries[0].isIntersecting;
      });
      editorObserver.observe(editorCode);
    }
    const resetCode = () => {
      codeNodes.flat().forEach(({ node }) => {
        node.textContent = '';
      });
      codeLines.forEach((line) => line.classList.remove('is-typing'));
      lineIndex = 0;
      characterIndex = 0;
    };
    const typeCharacter = () => {
      if (document.hidden || !editorVisible || siteLoader?.classList.contains('is-loading')) {
        typingTimer = window.setTimeout(typeCharacter, 300);
        return;
      }
      if (lineIndex === codeLines.length) {
        resetCode();
      }
      const line = codeLines[lineIndex];
      codeLines[lineIndex - 1]?.classList.remove('is-typing');
      line.classList.add('is-typing');
      characterIndex += 1;
      let remaining = characterIndex;
      codeNodes[lineIndex].forEach(({ node, text }) => {
        node.textContent = text.slice(0, Math.max(0, remaining));
        remaining -= text.length;
      });
      const lineLength = codeNodes[lineIndex].reduce((total, { text }) => total + text.length, 0);
      const character = codeNodes[lineIndex].map(({ text }) => text).join('')[characterIndex - 1];
      let delay = /[>.;]/.test(character) ? 110 : 40;
      if (characterIndex >= lineLength) {
        lineIndex += 1;
        characterIndex = 0;
        delay = lineIndex === codeLines.length ? 2200 : 180;
      }
      typingTimer = window.setTimeout(typeCharacter, delay);
    };
    const setTypingMotion = () => {
      window.clearTimeout(typingTimer);
      codeLines.forEach((line) => line.classList.remove('is-typing'));
      // O atributo preserva a digitação contínua solicitada para a primeira tela.
      const typingEnabled = editorCode.dataset.typing === 'always' || !motionPreference.matches;
      editorCode.classList.toggle('is-animating', typingEnabled);
      if (!typingEnabled) {
        codeNodes.flat().forEach(({ node, text }) => {
          node.textContent = text;
        });
      } else {
        resetCode();
        typingTimer = window.setTimeout(typeCharacter, 120);
      }
    };
    motionPreference.addEventListener('change', setTypingMotion);
    setTypingMotion();
  }

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-nav');
  const contactForm = document.querySelector('#quote-form');
  const formStatus = document.querySelector('#form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');

  // Fecha o menu e devolve o foco ao botão quando a pessoa usa Esc.
  function setMenuOpen(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.inert = !open;
    document.body.classList.toggle('menu-open', open);
  }

  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  // O menu mobile não deve permanecer aberto depois que a tela aumenta.
  window.matchMedia('(min-width: 1001px)').addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });

  // Evidencia a seção correspondente ao rolar a página.
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-18% 0px -63% 0px' }
    );
    ['inicio', 'projetos', 'servicos', 'sobre'].forEach((id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  // Quando a pessoa vem do card de serviço, já seleciona a opção do formulário.
  document.querySelectorAll('[data-project-type]').forEach((link) => {
    link.addEventListener('click', () => {
      document.getElementById('projectType').value = link.dataset.projectType;
    });
  });

  document.querySelector('#current-year').textContent = new Date().getFullYear();

  function showStatus(type, message) {
    formStatus.dataset.state = type;
    formStatus.textContent = message;
  }

  // Apaga o aviso anterior e remove a indicação de erro quando o campo muda.
  contactForm.querySelectorAll('input,select,textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
      if (formStatus.dataset.state === 'error') {
        delete formStatus.dataset.state;
        formStatus.textContent = '';
      }
    });
  });

  let submissionKey = crypto.randomUUID();
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.querySelectorAll('[required]').forEach((field) => {
        if (!field.validity.valid) field.setAttribute('aria-invalid', 'true');
      });
      contactForm.reportValidity();
      showStatus('error', 'Confira os campos obrigatórios antes de enviar.');
      return;
    }

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    payload.privacyAccepted = document.getElementById('privacyAccepted').checked;
    payload.noticeVersion = '2026-10-21';
    const previousButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando sua solicitação...';
    delete formStatus.dataset.state;

    try {
      // O backend usa SMTP. Não são colocadas senhas ou credenciais no JavaScript.
      const response = await fetch('/api/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submissionKey },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 503 || response.status === 404) {
          throw new Error(
            'O recebimento de solicitações ainda está sendo preparado. Tente novamente mais tarde.'
          );
        }
        if (response.status === 429) {
          throw new Error(
            'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
          );
        }
        throw new Error(
          data.message || 'Não foi possível enviar agora. Tente novamente em instantes.'
        );
      }

      contactForm.reset();
      submissionKey = crypto.randomUUID();
      showStatus(
        'success',
        data.message || 'Solicitação recebida! Responderei pelo contato informado.'
      );
    } catch (error) {
      const message =
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.'
          : error.message;
      showStatus('error', message);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = previousButtonText;
    }
  });
})();
