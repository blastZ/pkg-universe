import { type JestConfigWithTsJest } from 'ts-jest';

const DEFAULT_OPTIONS: JestConfigWithTsJest = {
  rootDir: '.',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export function getJestConfig(
  rootDirOrOptions: string | JestConfigWithTsJest = {},
): JestConfigWithTsJest {
  const options =
    typeof rootDirOrOptions === 'string'
      ? { rootDir: rootDirOrOptions }
      : rootDirOrOptions;

  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}

export function getJestConfigForMonorepo(
  optionsList: (string | JestConfigWithTsJest)[] = [],
): JestConfigWithTsJest {
  return {
    projects: optionsList.map((options) => getJestConfig(options)) as any,
  };
}
