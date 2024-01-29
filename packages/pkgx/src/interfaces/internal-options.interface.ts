import { CmdBuildPackageOptions } from './build/cmd-build-package-options.interface.js';

interface BuildInternalOptions {
  cmdName: 'build';
  cmdOptions: CmdBuildPackageOptions;
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
