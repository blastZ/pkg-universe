import { CmdBuildOptions } from './cmd-build-options.interface.js';

interface BuildInternalOptions {
  cmdName: 'build';
  cmdOptions: CmdBuildOptions;
}

interface TestInternalOptions {
  cmdName: 'test';
}

interface PublishInternalOptions {
  cmdName: 'publish';
}

interface ServeInternalOptions {
  cmdName: 'serve';
}

interface BuildNestNextInternalOptions {
  cmdName: 'build-nest-next';
}

export type InternalOptions =
  | BuildInternalOptions
  | TestInternalOptions
  | PublishInternalOptions
  | ServeInternalOptions
  | BuildNestNextInternalOptions;
