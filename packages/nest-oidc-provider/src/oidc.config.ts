import { ModuleMetadata, Type } from '@nestjs/common';
import { Configuration } from 'oidc-provider';

export const OIDC_CONFIG = 'OIDC_CONFIG';

export interface OidcConfig {
  issuer: string;
  path?: string;
  configuration?: Configuration;
}

export interface OidcConfigFactory {
  createOidcConfig: (...args: any[]) => OidcConfig;
}

export interface OidcDynamicConfig extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<OidcConfig> | OidcConfig;
  inject?: any[];
  useClass?: Type<OidcConfigFactory>;
  useExist?: Type<OidcConfigFactory>;
}
