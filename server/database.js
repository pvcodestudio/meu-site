/** Consultas parametrizadas; dados pessoais permanecem cifrados no MySQL.
 * Autor: Pedro Vitor — PVcoding Studio.
 */
import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { createVault } from './security.js';

export function createRepository(config) {
  const pool = mysql.createPool(config.database);
  const vault = createVault(config.encryptionKey);
  return {
    async ready() {
      await pool.query('SELECT id FROM quote_requests LIMIT 0');
      await pool.query('SELECT setting_key FROM site_settings LIMIT 0');
      await pool.query('SELECT id FROM admin_audit LIMIT 0');
    },
    async settings() {
      const [rows] = await pool.execute(
        'SELECT encrypted_value FROM site_settings WHERE setting_key = ?',
        ['site']
      );
      return rows.length ? vault.open(rows[0].encrypted_value) : { ...config.defaults };
    },
    async saveSettings(value) {
      await pool.execute(
        'INSERT INTO site_settings (setting_key, encrypted_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE encrypted_value = VALUES(encrypted_value)',
        ['site', vault.seal(value)]
      );
    },
    async insert(quote, submissionKey, noticeVersion) {
      const id = randomUUID();
      try {
        await pool.execute(
          'INSERT INTO quote_requests (id, submission_key, encrypted_payload, notice_version) VALUES (?, ?, ?, ?)',
          [id, submissionKey, vault.seal(quote), noticeVersion]
        );
        return { id, duplicate: false };
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
        return { duplicate: true };
      }
    },
    async list(page) {
      // O limite é fixo. O deslocamento vem de um inteiro validado pela API.
      const [rows] = await pool.query(
        'SELECT id, encrypted_payload, created_at, notification_status FROM quote_requests ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET ?',
        [(page - 1) * 20]
      );
      return rows.map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        notificationStatus: row.notification_status,
        quote: vault.open(row.encrypted_payload)
      }));
    },
    async get(id) {
      const [rows] = await pool.execute(
        'SELECT encrypted_payload, created_at, notification_status, notice_version FROM quote_requests WHERE id = ?',
        [id]
      );
      if (!rows.length) return null;
      return {
        id,
        createdAt: rows[0].created_at,
        notificationStatus: rows[0].notification_status,
        noticeVersion: rows[0].notice_version,
        quote: vault.open(rows[0].encrypted_payload)
      };
    },
    async remove(id) {
      const [result] = await pool.execute('DELETE FROM quote_requests WHERE id = ?', [id]);
      return result.affectedRows > 0;
    },
    async notification(id, status) {
      await pool.execute('UPDATE quote_requests SET notification_status = ? WHERE id = ?', [
        status,
        id
      ]);
    },
    async audit(action, resourceId = null) {
      await pool.execute('INSERT INTO admin_audit (action, resource_id) VALUES (?, ?)', [
        action,
        resourceId
      ]);
    },
    async prune(days) {
      await pool.execute(
        'DELETE FROM quote_requests WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)',
        [days]
      );
      await pool.query(
        'DELETE FROM admin_audit WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90 DAY)'
      );
    },
    close: () => pool.end()
  };
}
