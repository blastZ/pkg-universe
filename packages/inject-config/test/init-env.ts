import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

process.env.INJECT_CONFIG_PATH = resolve(__dirname, './config');
