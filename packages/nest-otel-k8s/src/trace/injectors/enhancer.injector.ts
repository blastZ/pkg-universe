import {
  CanActivate,
  ExceptionFilter,
  Injectable,
  Logger,
  NestInterceptor,
  PipeTransform,
  Type,
} from '@nestjs/common';
import {
  EXCEPTION_FILTERS_METADATA,
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  PIPES_METADATA,
} from '@nestjs/common/constants.js';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  ModuleRef,
  ModulesContainer,
} from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import { Module } from '@nestjs/core/injector/module.js';
import { SpanOptions } from '@opentelemetry/api';

import { AttributeNames, EnhancerScope } from '../../open-telemetry.enums.js';
import { BaseInjector } from './base.injector.js';

export enum EnhancerType {
  PIPE = 'pipe',
  GUARD = 'guard',
  INTERCEPTOR = 'interceptor',
  FILTER = 'enhancer',
}

const enhancerInfoMap: Record<
  EnhancerType,
  {
    metadataKey: string;
    methodKey: string;
    traceName: string;
    globalToken: string;
  }
> = {
  [EnhancerType.PIPE]: {
    metadataKey: PIPES_METADATA,
    methodKey: 'transform',
    traceName: 'Pipe',
    globalToken: APP_PIPE,
  },
  [EnhancerType.GUARD]: {
    metadataKey: GUARDS_METADATA,
    methodKey: 'canActivate',
    traceName: 'Guard',
    globalToken: APP_GUARD,
  },
  [EnhancerType.INTERCEPTOR]: {
    metadataKey: INTERCEPTORS_METADATA,
    methodKey: 'intercept',
    traceName: 'Interceptor',
    globalToken: APP_INTERCEPTOR,
  },
  [EnhancerType.FILTER]: {
    metadataKey: EXCEPTION_FILTERS_METADATA,
    methodKey: 'catch',
    traceName: 'ExceptionFilter',
    globalToken: APP_FILTER,
  },
};

@Injectable()
export abstract class EnhancerInjector<
  T extends PipeTransform | CanActivate | NestInterceptor | ExceptionFilter,
> extends BaseInjector {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly globalToken: string;
  protected readonly metadataKey: string;
  protected readonly methodKey: string;
  protected readonly traceName: string;

  public constructor(
    modulesContainer: ModulesContainer,
    protected readonly enhancerType: EnhancerType,
  ) {
    super(modulesContainer);
    const info = enhancerInfoMap[enhancerType];
    this.globalToken = info.globalToken;
    this.metadataKey = info.metadataKey;
    this.traceName = info.traceName;
    this.methodKey = info.methodKey;
  }

  public inject(): void {
    this.injectGlobals();
    this.injectControllers();
  }

  protected injectGlobals(): void {
    const providers = this.getProviders();

    for (const provider of providers) {
      const prototype = provider.metatype.prototype;
      if (
        typeof provider.token === 'string' &&
        provider.token.includes(this.globalToken) &&
        !this.isAffected(prototype[this.methodKey])
      ) {
        const traceName = `${this.traceName} -> Global -> ${provider.metatype.name}`;
        prototype[this.methodKey] = this.wrap(
          prototype[this.methodKey],
          traceName,
          {
            attributes: {
              [AttributeNames.ENHANCER]: provider.metatype.name,
              [AttributeNames.ENHANCER_TYPE]: this.enhancerType,
              [AttributeNames.ENHANCER_SCOPE]: EnhancerScope.GLOBAL,
              [AttributeNames.INJECTOR]: this.constructor.name,
            },
          },
        );
        this.affect(provider.metatype);
        this.logger.log(`Mapped ${traceName}`);
      }
    }
  }

  protected injectControllers(): void {
    const controllers = this.getControllers();

    for (const controller of controllers) {
      if (this.isEnhanced(controller.metatype)) {
        const enhancers = this.getEnhancers(controller.metatype).map(
          (enhancer) => {
            const prototype =
              typeof enhancer === 'function' ? enhancer['prototype'] : enhancer;

            const traceName = `${this.traceName} -> ${controller.name}.${prototype.constructor.name}`;
            this.logger.log(`Mapped ${traceName}`);
            return this.wrapEnhancerMethod(controller, enhancer, traceName, {
              attributes: {
                [AttributeNames.ENHANCER_SCOPE]: EnhancerScope.CONTROLLER,
              },
            });
          },
        );

        if (enhancers.length > 0)
          Reflect.defineMetadata(
            this.metadataKey,
            enhancers,
            controller.metatype,
          );
      }

      const controllerProto = controller.metatype.prototype;

      const keys = this.metadataScanner.getAllMethodNames(controllerProto);

      for (const key of keys) {
        if (this.isEnhanced(controllerProto[key])) {
          const enhancers = this.getEnhancers(controllerProto[key]).map(
            (enhancer) => {
              const enhancerProto =
                typeof enhancer === 'function'
                  ? enhancer['prototype']
                  : enhancer;
              const traceName = `${this.traceName} -> ${controller.name}.${controllerProto[key].name}.${enhancerProto.constructor.name}`;

              this.logger.log(`Mapped ${traceName}`);
              return this.wrapEnhancerMethod(controller, enhancer, traceName, {
                attributes: {
                  [AttributeNames.ENHANCER_SCOPE]: EnhancerScope.METHOD,
                  [AttributeNames.PROVIDER_METHOD]: controllerProto[key].name,
                },
              });
            },
          );

          if (enhancers.length > 0) {
            Reflect.defineMetadata(
              this.metadataKey,
              enhancers,
              controllerProto[key],
            );
          }
        }
      }
    }
  }

  protected getEnhancers(target: object): (Type<T> | T)[] {
    return Reflect.getMetadata(this.metadataKey, target) || [];
  }

  protected isEnhanced(target: object): boolean {
    return Reflect.hasMetadata(this.metadataKey, target);
  }

  protected wrapEnhancer<T extends object>(
    classOrInstance: Type<T> | T,
  ): Type<T> | T {
    if (typeof classOrInstance !== 'function')
      return Object.create(classOrInstance);
    const wrappedEnhancer = class WrappedEnhancer extends classOrInstance {};
    Reflect.defineProperty(wrappedEnhancer, 'name', {
      value: classOrInstance.name,
      writable: false,
    });
    this.reDecorate(classOrInstance, wrappedEnhancer);
    return wrappedEnhancer;
  }

  protected wrapEnhancerMethod(
    controller: InstanceWrapper,
    enhancer: Type<T> | T,
    traceName: string,
    spanOptions: SpanOptions = {},
  ): Type<T> | T {
    const wrappedEnhancer = this.wrapEnhancer(enhancer);
    const enhancerProto =
      typeof wrappedEnhancer === 'function'
        ? wrappedEnhancer['prototype']
        : wrappedEnhancer;

    enhancerProto[this.methodKey] = this.wrap(
      enhancerProto[this.methodKey],
      traceName,
      {
        ...spanOptions,
        attributes: {
          [AttributeNames.MODULE]: controller.host?.name,
          [AttributeNames.CONTROLLER]: controller.name,
          [AttributeNames.ENHANCER]: enhancerProto.constructor.name,
          [AttributeNames.ENHANCER_TYPE]: this.enhancerType,
          [AttributeNames.INJECTOR]: this.constructor.name,
          ...spanOptions.attributes,
        },
      },
    );

    if (typeof wrappedEnhancer === 'function' && typeof enhancer === 'function')
      this.resolveWrappedEnhancer(controller.host!, enhancer, wrappedEnhancer);

    return wrappedEnhancer;
  }

  protected resolveWrappedEnhancer<
    T extends PipeTransform | CanActivate | NestInterceptor | ExceptionFilter,
  >(module: Module, enhancer: Type<T>, wrappedEnhancer: Type<T>): void {
    const instanceWrapper = module.injectables.get(enhancer);
    module.addCustomClass(
      {
        provide: wrappedEnhancer,
        useClass: wrappedEnhancer,
      },
      module.injectables,
      instanceWrapper?.subtype,
    );

    const moduleRef = module.providers.get(ModuleRef)!.instance as ModuleRef;
    moduleRef.create(wrappedEnhancer).then((value) => {
      const instanceWrapper = module.injectables.get(wrappedEnhancer)!;
      instanceWrapper.instance = value;
    });
  }
}
