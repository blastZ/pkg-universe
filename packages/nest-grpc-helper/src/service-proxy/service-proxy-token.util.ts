export function serviceProxyToken(packageName: string, serviceName: string) {
  return `@blastz/nest-grpc-helper/${packageName}/${serviceName}`;
}
