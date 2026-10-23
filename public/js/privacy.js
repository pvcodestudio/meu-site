/** Dados públicos do aviso. Pedro Vitor — PVcoding Studio. */
fetch('/api/privacy', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error('indisponível');
    return response.json();
  })
  .then((info) => {
    document.getElementById('retention-days').textContent = String(info.retentionDays);
    if (info.contactEmail) {
      const contact = document.getElementById('privacy-contact');
      const link = document.createElement('a');
      link.href = `mailto:${info.contactEmail}`;
      link.textContent = info.contactEmail;
      contact.replaceChildren(
        'Para pedidos relacionados aos seus dados, entre em contato: ',
        link,
        '.'
      );
    }
  })
  .catch(() => {
    document.getElementById('privacy-contact').textContent =
      'Não foi possível consultar o contato de privacidade. Tente novamente mais tarde.';
  });
