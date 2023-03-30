module.exports = {
  logger: {
    consoleLevel: 'error',
  },
  redis: {
    port: 5252,
  },
  wsProxies: [
    {
      target: '127.0.0.1',
    },
  ],
};
