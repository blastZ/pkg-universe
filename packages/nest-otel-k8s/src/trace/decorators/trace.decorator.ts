import { Logger, SetMetadata } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import type { Attributes } from '@opentelemetry/api/build/src/common/Attributes.js';
import type { SpanKind } from '@opentelemetry/api/build/src/trace/span_kind.js';
import { BaseInjector } from '../injectors/index.js';

import { TRACE_METADATA } from '../../open-telemetry.enums.js';

export interface TraceOptions {
  /**
   * The SpanKind of a span
   * @default {@link SpanKind.INTERNAL}
   */
  kind?: SpanKind;
  /** A span's attributes */
  attributes?: Attributes;
  /** The new span should be a root span. (Ignore parent from context). */
  root?: boolean;
  name?: string;
}

export function Trace<T extends TraceOptions | undefined | string>(
  optionsOrName?: T,
): keyof T extends never ? MethodDecorator & ClassDecorator : MethodDecorator {
  const options =
    typeof optionsOrName === 'string'
      ? { name: optionsOrName }
      : optionsOrName ?? {};
  return SetMetadata(TRACE_METADATA, options);
}

const metadataScanner = new MetadataScanner();
const logger = new Logger('TracePlain');
export function TracePlain<T extends TraceOptions | undefined | string>(
  optionsOrName?: T,
): keyof T extends never ? MethodDecorator & ClassDecorator : MethodDecorator {
  const options: TraceOptions =
    typeof optionsOrName === 'string'
      ? { name: optionsOrName }
      : optionsOrName ?? {};
  return (target: Function | object, propertyKey?: any, descriptor?: any) => {
    const prototype = typeof target === 'function' ? target.prototype : target;
    const injector = BaseInjector.prototype;
    if (descriptor) {
      if (!injector['isAffected'](descriptor.value)) {
        const name = `Class -> ${prototype.constructor.name}.${propertyKey}`;
        descriptor.value = injector['wrap'](descriptor.value, name, options);
        logger.log(`Mapped ${name}`);
      }
      return descriptor;
    }
    const keys = metadataScanner.getAllMethodNames(prototype);

    for (const key of keys) {
      if (!injector['isAffected'](prototype[key])) {
        const name = `Class -> ${prototype.constructor.name}.${key}`;
        prototype[key] = injector['wrap'](prototype[key], name);
        logger.log(`Mapped ${name}`);
      }
    }
    return target;
  };
}
