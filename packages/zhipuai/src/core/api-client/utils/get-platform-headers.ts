import { VERSION } from '../version.js';

type Arch = 'x32' | 'x64' | 'arm' | 'arm64' | `other:${string}` | 'unknown';

type PlatformName =
  | 'MacOS'
  | 'Linux'
  | 'Windows'
  | 'FreeBSD'
  | 'OpenBSD'
  | 'iOS'
  | 'Android'
  | `Other:${string}`
  | 'Unknown';

type Browser = 'ie' | 'edge' | 'chrome' | 'firefox' | 'safari';

type PlatformProperties = {
  'X-Stainless-Lang': 'js';
  'X-Stainless-Package-Version': string;
  'X-Stainless-OS': PlatformName;
  'X-Stainless-Arch': Arch;
  'X-Stainless-Runtime':
    | 'node'
    | 'deno'
    | 'edge'
    | `browser:${Browser}`
    | 'unknown';
  'X-Stainless-Runtime-Version': string;
};

let _platformHeaders: PlatformProperties;

export const getPlatformHeaders = () => {
  return (_platformHeaders ??= getPlatformProperties());
};

const getPlatformProperties = (): PlatformProperties => {
  // if (typeof Deno !== 'undefined' && Deno.build != null) {
  //   return {
  //     'X-Stainless-Lang': 'js',
  //     'X-Stainless-Package-Version': VERSION,
  //     'X-Stainless-OS': normalizePlatform(Deno.build.os),
  //     'X-Stainless-Arch': normalizeArch(Deno.build.arch),
  //     'X-Stainless-Runtime': 'deno',
  //     'X-Stainless-Runtime-Version':
  //       typeof Deno.version === 'string'
  //         ? Deno.version
  //         : Deno.version?.deno ?? 'unknown',
  //   };
  // }

  // if (typeof EdgeRuntime !== 'undefined') {
  //   return {
  //     'X-Stainless-Lang': 'js',
  //     'X-Stainless-Package-Version': VERSION,
  //     'X-Stainless-OS': 'Unknown',
  //     'X-Stainless-Arch': `other:${EdgeRuntime}`,
  //     'X-Stainless-Runtime': 'edge',
  //     'X-Stainless-Runtime-Version': process.version,
  //   };
  // }

  // Check if Node.js
  if (
    Object.prototype.toString.call(
      typeof process !== 'undefined' ? process : 0,
    ) === '[object process]'
  ) {
    return {
      'X-Stainless-Lang': 'js',
      'X-Stainless-Package-Version': VERSION,
      'X-Stainless-OS': normalizePlatform(process.platform),
      'X-Stainless-Arch': normalizeArch(process.arch),
      'X-Stainless-Runtime': 'node',
      'X-Stainless-Runtime-Version': process.version,
    };
  }

  // const browserInfo = getBrowserInfo();
  // if (browserInfo) {
  //   return {
  //     'X-Stainless-Lang': 'js',
  //     'X-Stainless-Package-Version': VERSION,
  //     'X-Stainless-OS': 'Unknown',
  //     'X-Stainless-Arch': 'unknown',
  //     'X-Stainless-Runtime': `browser:${browserInfo.browser}`,
  //     'X-Stainless-Runtime-Version': browserInfo.version,
  //   };
  // }

  // TODO add support for Cloudflare workers, etc.
  return {
    'X-Stainless-Lang': 'js',
    'X-Stainless-Package-Version': VERSION,
    'X-Stainless-OS': 'Unknown',
    'X-Stainless-Arch': 'unknown',
    'X-Stainless-Runtime': 'unknown',
    'X-Stainless-Runtime-Version': 'unknown',
  };
};

const normalizeArch = (arch: string): Arch => {
  if (arch === 'x32') return 'x32';
  if (arch === 'x86_64' || arch === 'x64') return 'x64';
  if (arch === 'arm') return 'arm';
  if (arch === 'aarch64' || arch === 'arm64') return 'arm64';

  if (arch) return `other:${arch}`;

  return 'unknown';
};

const normalizePlatform = (platform: string): PlatformName => {
  platform = platform.toLowerCase();

  if (platform.includes('ios')) return 'iOS';
  if (platform === 'android') return 'Android';
  if (platform === 'darwin') return 'MacOS';
  if (platform === 'win32') return 'Windows';
  if (platform === 'freebsd') return 'FreeBSD';
  if (platform === 'openbsd') return 'OpenBSD';
  if (platform === 'linux') return 'Linux';

  if (platform) return `Other:${platform}`;

  return 'Unknown';
};
