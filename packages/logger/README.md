# Logger

Node.js logger based on [winston](https://github.com/winstonjs/winston).

## Install

```bash
$ npm install @blastz/logger
```

## Usage

```ts
import { logger, LoggerLevel, createConsoleTransport } from "@blastz/logger";

logger.clear().add(createConsoleTransport());

logger.info("hello world!");
```

## Logging levels

The logger support six loggin levels

```ts
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
```

## Console transport

Call `createConsoleTransport` method to create console transport.

Console transport will output logs with such format

```bash
2021-05-14T06:30:02.421Z  INFO
{
  message: 'test',
  hostname: 'OMEN',
  pid: 32684
}
```

## File transport

Call `createFileTransport` to create file transport

```ts
logger
  .clear()
  .add(createFileTransport({ level: LoggerLevel.Trace }))
  .add(createFileTransport({ level: LoggerLevel.Error }));
```

It will create two folds `error` and `trace`

- log
  - error
  - trace

The error fold will include loggin files that logging level is above `error`, and trace fold
will include loggin files above `trace`.

File transport will log with json format

```bash
{"message":"trace","level":"trace","hostname":"OMEN","pid":762,"timestamp":"2021-05-14T06:51:59.894Z"}
```

All options in [winston-daily-rotate-file](https://github.com/winstonjs/winston-daily-rotate-file) are supported by function options.

## Custom metadatas

When you need some custom metadatas, like trace id. you can pass `AsyncLocalStorage` to the logger `context`.

```ts
const context = new AsyncLocalStorage<Record<string, unknown>>();

logger.context = context;

logger.clear().add(createConsoleTransport());

store.run({ traceId: "xxx" }, () => {
  logger.info("test");
});
```

The console ouput will include `traceId` property.

## Options

Check all transport options in the `src/interfaces/${transportName}.interface.ts`

## License

Licensed under MIT
