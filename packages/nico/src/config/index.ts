import { Config } from '../interfaces/index.js';

import custom from './custom.js';
import responses from './responses.js';
import routes from './routes.js';
import security from './security.js';

const config: Config = {
  custom,
  routes,
  security,
  responses,
  serve: {},
  advancedConfigs: {
    forceExitTime: 10 * 1000,
  },
  helpers: {},
};

export default config;
