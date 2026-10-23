/** Gera credenciais localmente. Execute no seu terminal; não compartilhe a saída.
 * Autor: Pedro Vitor — PVcoding Studio.
 */
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../server/security.js';
const password = randomBytes(24).toString('base64url');
console.log('Guarde a senha em um gerenciador. Ela não será gravada pelo script.');
console.log(`Senha administrativa: ${password}`);
console.log(`ADMIN_PASSWORD_HASH='${await hashPassword(password)}'`);
console.log(`DATA_ENCRYPTION_KEY=${randomBytes(32).toString('hex')}`);
console.log(
  'Em instalação existente, preserve DATA_ENCRYPTION_KEY; troque apenas o hash de senha.'
);
