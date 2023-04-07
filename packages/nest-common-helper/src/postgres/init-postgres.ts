import { types } from 'pg';

export function initPostgres() {
  types.setTypeParser(20, (val) => parseInt(val, 10));
  types.setTypeParser(1700, (val) => parseFloat(val));
}
