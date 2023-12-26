import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getCliVersion() {
  const packageStr = readFileSync(
    resolve(__dirname, '../package.json'),
  ).toString();

  const packageInfo = JSON.parse(packageStr);

  return packageInfo.version;
}
