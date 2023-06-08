import { HEALTH_PACKAGE_NAME } from './health-package-name.constant.js';

export function healthClientKey(packageName: string) {
  return `${packageName}_${HEALTH_PACKAGE_NAME}`;
}
