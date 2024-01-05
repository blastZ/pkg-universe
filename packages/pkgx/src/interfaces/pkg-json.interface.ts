export interface PkgJson {
  name: string;
  type?: 'module' | 'commonjs';
  main?: string;
  exports?: Record<string, string>;
  scripts?: Record<string, string>;
  types?: string;
  version?: string;
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  homepage?: string;
  author?: string;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  images?: {
    [target: string]: {
      registry: string;
      namespaces: {
        [namespace: string]: string[];
      };
    };
  };
}
