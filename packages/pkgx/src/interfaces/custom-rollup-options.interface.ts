import { ExternalOption } from 'rollup';

export interface CustomRollupOptions {
  input?: string;
  outputDir?: string;
  external?: ExternalOption;
}
