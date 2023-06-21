export const SDK_CONFIG = Symbol('OPEN_TELEMETRY_SDK_CONFIG');
export const SDK_INJECTORS = Symbol('SDK_INJECTORS');
export const TRACE_METADATA = Symbol('OPEN_TELEMETRY_TRACE_METADATA');
export const TRACE_METADATA_ACTIVE = Symbol(
  'OPEN_TELEMETRY_TRACE_METADATA_ACTIVE',
);

export enum AttributeNames {
  MODULE = 'nestjs.module',
  PROVIDER = 'nestjs.provider',
  PROVIDER_SCOPE = 'nestjs.provider.scope',
  PROVIDER_METHOD = 'nestjs.provider.method',
  PARAM_INDEX = 'nestjs.provider.method.param.index',
  INJECTOR = 'nestjs.injector',
  CONTROLLER = 'nestjs.controller',
  ENHANCER = 'nestjs.enhancer',
  ENHANCER_TYPE = 'nestjs.enhancer.type',
  ENHANCER_SCOPE = 'nestjs.enhancer.scope',
  MIDDLEWARE = 'nestjs.middleware',
}

export enum ProviderScope {
  REQUEST = 'REQUEST',
  TRANSIENT = 'TRANSIENT',
  DEFAULT = 'DEFAULT',
}

export enum EnhancerScope {
  CONTROLLER = 'CONTROLLER',
  METHOD = 'METHOD',
  PARAM = 'PARAM',
  GLOBAL = 'GLOBAL',
}
