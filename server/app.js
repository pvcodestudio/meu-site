/** Rotas do site. Autor: Pedro Vitor — PVcoding Studio. */
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateQuote, validEmail } from './validation.js';
import { verifyPassword, token, maskQuote } from './security.js';

export const NOTICE_VERSION = '2026-10-21';
const validId = (value) => /^[a-f0-9-]{36}$/.test(value);
const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export function createApp({ config, repository, mailer, now = Date.now }) {
  const app = express();
  const sessions = new Map();
  let activeLogins = 0;
  const cookieName = config.production ? '__Host-pvadmin' : 'pvadmin';
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: config.production ? [] : null
        }
      }
    })
  );
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '18kb', strict: true }));
  function available(_req, res, next) {
    if (!repository)
      return res
        .status(503)
        .json({
          message:
            'O recebimento de solicitações ainda está sendo preparado. Tente novamente mais tarde.'
        });
    next();
  }
  function sameOrigin(req, res, next) {
    if (req.get('Origin') !== config.origin || !req.is('application/json'))
      return res.status(403).json({ message: 'Origem da solicitação não autorizada.' });
    next();
  }
  function cleanupSessions() {
    for (const [id, session] of sessions)
      if (session.idleUntil <= now() || session.expiresAt <= now()) sessions.delete(id);
  }
  function authenticate(req, res, next) {
    cleanupSessions();
    const entry = (req.headers.cookie || '')
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${cookieName}=`));
    const session = entry ? sessions.get(entry.slice(cookieName.length + 1)) : undefined;
    if (!session) return res.status(401).json({ message: 'Entre novamente para continuar.' });
    if (config.production && !req.secure)
      return res.status(403).json({ message: 'Use uma conexão HTTPS.' });
    session.idleUntil = now() + 30 * 60 * 1000;
    req.adminSession = session;
    next();
  }
  function csrf(req, res, next) {
    if (req.get('X-CSRF-Token') !== req.adminSession.csrf)
      return res.status(403).json({ message: 'Sessão de formulário inválida. Atualize a página.' });
    next();
  }
  const limit = (windowMs, max) =>
    rateLimit({
      windowMs,
      limit: max,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { message: 'Muitas tentativas. Aguarde alguns minutos.' }
    });
  async function notify(id, settings) {
    let status = 'failed';
    try {
      if (mailer && validEmail(settings.notificationEmail)) {
        await mailer.sendMail({
          from: config.mailFrom,
          to: settings.notificationEmail,
          subject: '[PVcoding Studio] Nova solicitação de orçamento',
          text: `Uma solicitação foi recebida. Consulte os detalhes na área protegida:\n${config.origin}/admin#${id}\n\nPedro Vitor — PVcoding Studio`
        });
        status = 'sent';
      }
    } catch {
      console.warn('Não foi possível enviar uma notificação de orçamento.');
    }
    await repository.notification(id, status);
    return status;
  }
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get(
    '/api/privacy',
    route(async (_req, res) => {
      const settings = repository ? await repository.settings() : config.defaults;
      res.json({
        contactEmail: settings.privacyEmail || '',
        retentionDays: settings.retentionDays,
        noticeVersion: NOTICE_VERSION
      });
    })
  );
  app.post(
    '/api/orcamento',
    limit(15 * 60 * 1000, 6),
    sameOrigin,
    available,
    route(async (req, res) => {
      if (typeof req.body?.website === 'string' && req.body.website.trim())
        return res.json({ message: 'Solicitação recebida.' });
      const quote = validateQuote(req.body);
      if (!quote || req.body.privacyAccepted !== true || req.body.noticeVersion !== NOTICE_VERSION)
        return res
          .status(400)
          .json({ message: 'Confira os campos e a ciência do aviso de privacidade.' });
      const submissionKey = req.get('Idempotency-Key') || '';
      if (!/^[a-f0-9-]{36}$/i.test(submissionKey))
        return res.status(400).json({ message: 'Atualize a página e tente novamente.' });
      const settings = await repository.settings();
      if (
        !config.passwordHash ||
        !validEmail(settings.privacyEmail) ||
        !validEmail(settings.notificationEmail)
      )
        return res
          .status(503)
          .json({
            message:
              'O recebimento de solicitações ainda está sendo preparado. Tente novamente mais tarde.'
          });
      const result = await repository.insert(
        quote,
        createHash('sha256').update(submissionKey).digest('hex'),
        NOTICE_VERSION
      );
      if (!result.duplicate) {
        // Já está salvo: uma falha de SMTP não deve levar o cliente a duplicar o pedido.
        try {
          await notify(result.id, settings);
        } catch {
          console.warn('Solicitação salva; atualização da notificação pendente.');
        }
      }
      res
        .status(201)
        .json({ message: 'Solicitação recebida! Responderei pelo contato informado.' });
    })
  );
  app.post(
    '/api/admin/login',
    limit(15 * 60 * 1000, 10),
    sameOrigin,
    available,
    route(async (req, res) => {
      if (!config.passwordHash)
        return res
          .status(503)
          .json({ message: 'O acesso administrativo ainda não foi configurado no servidor.' });
      if (config.production && !req.secure)
        return res.status(403).json({ message: 'Use uma conexão HTTPS.' });
      if (activeLogins >= 4)
        return res
          .status(429)
          .json({ message: 'Aguarde alguns instantes antes de tentar novamente.' });
      activeLogins += 1;
      let correct;
      try {
        correct = await verifyPassword(req.body?.password, config.passwordHash);
      } finally {
        activeLogins -= 1;
      }
      if (!correct || req.body?.username !== config.adminUser)
        return res.status(401).json({ message: 'Usuário ou senha inválidos.' });
      cleanupSessions();
      if (sessions.size >= 100)
        return res.status(429).json({ message: 'Limite de sessões atingido.' });
      const id = token();
      const session = {
        csrf: token(),
        idleUntil: now() + 30 * 60 * 1000,
        expiresAt: now() + 8 * 60 * 60 * 1000
      };
      await repository.audit('login');
      sessions.set(id, session);
      res.cookie(cookieName, id, {
        httpOnly: true,
        secure: config.production,
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000
      });
      res.json({ csrfToken: session.csrf });
    })
  );
  app.use('/api/admin', authenticate, available);
  app.get('/api/admin/session', (req, res) => res.json({ csrfToken: req.adminSession.csrf }));
  app.post('/api/admin/logout', sameOrigin, csrf, (req, res) => {
    for (const [id, session] of sessions) if (session === req.adminSession) sessions.delete(id);
    res.clearCookie(cookieName, {
      path: '/',
      secure: config.production,
      httpOnly: true,
      sameSite: 'strict'
    });
    res.json({ ok: true });
  });
  app.get(
    '/api/admin/settings',
    route(async (_req, res) => res.json(await repository.settings()))
  );
  app.put(
    '/api/admin/settings',
    sameOrigin,
    csrf,
    route(async (req, res) => {
      const { notificationEmail, privacyEmail, retentionDays } = req.body;
      if (
        !validEmail(notificationEmail) ||
        !validEmail(privacyEmail) ||
        !Number.isInteger(retentionDays) ||
        retentionDays < 1 ||
        retentionDays > 365
      )
        return res
          .status(400)
          .json({ message: 'Informe e-mails válidos e retenção entre 1 e 365 dias.' });
      await repository.audit('settings_update');
      await repository.saveSettings({
        notificationEmail: notificationEmail.trim(),
        privacyEmail: privacyEmail.trim(),
        retentionDays
      });
      res.json({
        message: 'Configurações salvas. A limpeza seguirá o prazo informado em até uma hora.'
      });
    })
  );
  app.get(
    '/api/admin/quotes',
    route(async (req, res) => {
      const page = Number(req.query.page || 1);
      if (!Number.isInteger(page) || page < 1 || page > 10000)
        return res.status(400).json({ message: 'Página inválida.' });
      const rows = await repository.list(page);
      res.json({ page, items: rows.map(({ quote, ...row }) => ({ ...row, ...maskQuote(quote) })) });
    })
  );
  app.get(
    '/api/admin/quotes/:id',
    route(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ message: 'Identificador inválido.' });
      const quote = await repository.get(req.params.id);
      if (!quote) return res.status(404).json({ message: 'Solicitação não encontrada.' });
      await repository.audit('quote_view', req.params.id);
      res.json(quote);
    })
  );
  app.delete(
    '/api/admin/quotes/:id',
    sameOrigin,
    csrf,
    route(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ message: 'Identificador inválido.' });
      await repository.audit('quote_delete', req.params.id);
      const removed = await repository.remove(req.params.id);
      res
        .status(removed ? 200 : 404)
        .json({
          message: removed ? 'Solicitação excluída do banco ativo.' : 'Solicitação não encontrada.'
        });
    })
  );
  app.post(
    '/api/admin/quotes/:id/notify',
    limit(60 * 1000, 5),
    sameOrigin,
    csrf,
    route(async (req, res) => {
      if (!validId(req.params.id))
        return res.status(400).json({ message: 'Identificador inválido.' });
      if (!(await repository.get(req.params.id)))
        return res.status(404).json({ message: 'Solicitação não encontrada.' });
      await repository.audit('notification_retry', req.params.id);
      const status = await notify(req.params.id, await repository.settings());
      res
        .status(status === 'sent' ? 200 : 502)
        .json({
          message:
            status === 'sent'
              ? 'Notificação enviada.'
              : 'Não foi possível enviar. Confira o SMTP no servidor.'
        });
    })
  );
  app.use('/admin', (_req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    next();
  });
  app.get(['/admin', '/admin/'], (_req, res) =>
    res.sendFile(fileURLToPath(new URL('./views/admin.html', import.meta.url)))
  );
  app.get('/privacidade', (_req, res) =>
    res.sendFile(fileURLToPath(new URL('./views/privacy.html', import.meta.url)))
  );
  app.use(
    express.static(fileURLToPath(new URL('../public', import.meta.url)), {
      extensions: ['html'],
      maxAge: config.production ? '1h' : 0,
      dotfiles: 'deny'
    })
  );
  app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));
  app.use((error, _req, res, _next) => {
    const status =
      error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    if (status === 500) console.error('Falha interna ao processar solicitação.');
    res
      .status(status)
      .json({
        message:
          status === 500
            ? 'Não foi possível concluir a operação. Tente novamente mais tarde.'
            : 'Conteúdo da solicitação inválido.'
      });
  });
  return app;
}
