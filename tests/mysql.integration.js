/** Integração opcional em banco DESCARTÁVEL. Pedro Vitor — PVcoding Studio. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { readConfig } from '../server/config.js';
import { createRepository } from '../server/database.js';

test(
  'MySQL real: migração, cifragem, parâmetros, duplicidade, retenção e exclusão',
  { skip: process.env.RUN_MYSQL_TESTS !== '1' },
  async () => {
    // Não carrega .env para impedir que a suíte use o banco de produção por engano.
    const config = readConfig({
      ...process.env,
      DATA_ENCRYPTION_KEY: randomBytes(32).toString('hex')
    });
    if (!/^pvcoding_test_[a-z0-9_]+$/.test(config.database.database || ''))
      throw new Error('Use um banco descartável chamado pvcoding_test_<sufixo>.');
    const { connectionLimit, waitForConnections, queueLimit, ...connectionOptions } =
      config.database;
    const connection = await mysql.createConnection(connectionOptions);
    let repository;
    try {
      // Uma instância vazia é obrigatória; não limpar tabelas já existentes.
      const [tables] = await connection.query('SHOW TABLES');
      assert.equal(tables.length, 0, 'O banco de teste precisa estar vazio.');
      const sql = await readFile(new URL('../server/schema.sql', import.meta.url), 'utf8');
      for (const statement of sql
        .split(';')
        .map((value) => value.trim())
        .filter(Boolean))
        await connection.query(statement);
      repository = createRepository(config);
      await repository.ready();
      const settings = {
        notificationEmail: 'admin@example.com',
        privacyEmail: 'dados@example.com',
        retentionDays: 1
      };
      await repository.saveSettings(settings);
      assert.deepEqual(await repository.settings(), settings);
      const quote = {
        name: "Cliente ' OR 1=1 --",
        email: 'cliente@example.com',
        phone: '',
        projectType: 'Outro',
        budget: '',
        message: '<script>conteúdo sintético</script>',
        website: ''
      };
      const key = 'a'.repeat(64);
      const record = await repository.insert(quote, key, '2026-10-21');
      assert.equal((await repository.insert(quote, key, '2026-10-21')).duplicate, true);
      const [rows] = await connection.query('SELECT encrypted_payload FROM quote_requests');
      assert.ok(!rows[0].encrypted_payload.includes(quote.email));
      assert.deepEqual((await repository.get(record.id)).quote, quote);
      assert.equal((await repository.list(1)).length, 1);
      await repository.notification(record.id, 'sent');
      assert.equal((await repository.get(record.id)).notificationStatus, 'sent');
      await repository.audit('quote_view', record.id);
      await connection.execute(
        'UPDATE quote_requests SET created_at = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY) WHERE id = ?',
        [record.id]
      );
      await repository.prune(1);
      assert.equal(await repository.get(record.id), null);
      const next = await repository.insert(quote, 'b'.repeat(64), '2026-10-21');
      assert.equal(await repository.remove(next.id), true);
      assert.equal((await repository.list(1)).length, 0);
      // As tabelas permanecem para inspeção do operador. Descarte o banco depois do teste.
    } finally {
      await repository?.close();
      await connection.end();
    }
  }
);
