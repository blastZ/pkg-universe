import { type RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';

export function getNodeResolveOptions() {
  const resolveOptions: RollupNodeResolveOptions = {
    exportConditions: ['node'],
    preferBuiltins: true,
  };

  return resolveOptions;
}
