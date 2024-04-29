import pkg from './package.json' with { type: 'json' };

export default {
  replaceValues: {
    '__@@PKGX_REPLACE_WITH_PACKAGE_VERSION@@__': pkg.version,
  },
};
