import fs from 'fs';
import path from 'path';

export function getCliVersion() {
  const packageStr = fs
    .readFileSync(
      path.resolve(path.resolve(__dirname, '.'), '../../package.json'),
    )
    .toString();

  const packageInfo = JSON.parse(packageStr);

  return packageInfo.version;
}
