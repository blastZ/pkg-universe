export interface Shims {
  kind: string;
  fetch: any;
  getDefaultAgent: (url: string) => any;
}

export let kind: Shims['kind'] | undefined = undefined;
export let fetch: Shims['fetch'] | undefined = undefined;
export let getDefaultAgent: Shims['getDefaultAgent'] | undefined = undefined;

export function setShims(shims: Shims) {
  kind = shims.kind;
  fetch = shims.fetch;
  getDefaultAgent = shims.getDefaultAgent;
}
