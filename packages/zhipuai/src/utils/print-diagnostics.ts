import { inspect } from 'util';

function log(msg: string) {
  process.stderr.write(`[zhipuai::diagnostics] ${msg}` + '\n');
}

export function printDiagnostics(...args: any[]) {
  if (process.env.ZHIPU_AI_VERBOSE !== '1') {
    return;
  }

  log(inspect(args, false, 10, true));
}
