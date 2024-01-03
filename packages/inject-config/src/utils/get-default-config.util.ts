export function getDefaultConfig(config: unknown) {
  if (Array.isArray(config)) {
    return [];
  }

  return {};
}
