/** Criação aditiva das tabelas. Pedro Vitor — PVcoding Studio. */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { readConfig } from '../server/config.js';
const config = readConfig();
if (!config.databaseConfigured)
  throw new Error('Configure MySQL e DATA_ENCRYPTION_KEY antes da migração.');
const { connectionLimit, waitForConnections, queueLimit, ...connectionOptions } = config.database;
const connection = await mysql.createConnection(connectionOptions);
try {
  const sql = await readFile(new URL('../server/schema.sql', import.meta.url), 'utf8');
  // O arquivo pertence ao projeto. Nunca aceitar SQL vindo de visitantes.
  for (const statement of sql
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean))
    await connection.query(statement);
  console.log('Tabelas disponíveis. Nenhum registro anterior foi removido.');
} finally {
  await connection.end();
}
