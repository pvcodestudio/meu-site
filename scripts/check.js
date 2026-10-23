/** Valida todos os módulos JavaScript do projeto. Pedro Vitor — PVcoding Studio. */
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(`${dir}/${entry.name}`)
      : entry.name.endsWith('.js')
        ? [`${dir}/${entry.name}`]
        : []
  );
}
for (const file of ['server', 'public/js', 'scripts', 'tests'].flatMap(files)) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(1);
}
const result = spawnSync(process.execPath, ['--test', 'tests/*.test.js'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
