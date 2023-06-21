import type { Type } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { SpanKind, context, trace } from '@opentelemetry/api';
import type { Attributes } from '@opentelemetry/api/build/src/common/Attributes.js';
import { Span } from '@opentelemetry/sdk-trace-base';
import {
  DbSystemValues,
  SemanticAttributes,
} from '@opentelemetry/semantic-conventions';
import fg from 'fast-glob';
import type { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions.js';
import type { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions.js';
import type {
  DataSource,
  DatabaseType,
  EntityManager,
  EntityMetadata,
  EntityTarget,
  QueryRunner,
} from 'typeorm/index.js';

import { SDK_CONFIG } from '../../open-telemetry.enums.js';
import { OpenTelemetryModuleConfig } from '../../open-telemetry.interface.js';
import { BaseInjector } from './base.injector.js';

export interface TypeormInjectorOptions {
  /** set to `true` if you want to capture the parameter values for parameterized SQL queries (**may leak sensitive information**) */
  collectParameters?: boolean;
}

export const DB_STATEMENT_PARAMETERS = 'db.statement.parameters';

type EntityManagerMethods = keyof EntityManager;
const usingEntityPersistExecutor: EntityManagerMethods[] = [
  'save',
  'remove',
  'softRemove',
  'recover',
];
const usingQueryBuilder: EntityManagerMethods[] = [
  'insert',
  'update',
  'delete',
  'softDelete',
  'restore',
  'count',
  'find',
  'findAndCount',
  'findByIds',
  'findOne',
  'increment',
  'decrement',
];
const entityManagerMethods: EntityManagerMethods[] = [
  ...usingEntityPersistExecutor,
  ...usingQueryBuilder,
];

function getDbSystemValue(options: BaseDataSourceOptions): DbSystemValues {
  switch (options.type) {
    case 'mysql':
    case 'aurora-mysql':
      return DbSystemValues.MYSQL;
    case 'postgres':
    case 'aurora-postgres':
      return DbSystemValues.POSTGRESQL;
    case 'cockroachdb':
      return DbSystemValues.COCKROACHDB;
    case 'sap':
      return DbSystemValues.HANADB;
    case 'mariadb':
      return DbSystemValues.MARIADB;
    case 'oracle':
      return DbSystemValues.ORACLE;
    case 'mssql':
      return DbSystemValues.MSSQL;
    case 'mongodb':
      return DbSystemValues.MONGODB;
    case 'sqlite':
    case 'cordova':
    case 'react-native':
    case 'nativescript':
    case 'expo':
    case 'better-sqlite3':
    case 'capacitor':
    case 'sqljs':
      return DbSystemValues.SQLITE;
    default:
      return DbSystemValues.OTHER_SQL;
  }
}

const sqliteFamily: DatabaseType[] = [
  'sqlite',
  'cordova',
  'react-native',
  'nativescript',
  'expo',
  'better-sqlite3',
  'capacitor',
  'sqljs',
];

const auroraFamily: DatabaseType[] = ['aurora-mysql', 'aurora-postgres'];

function getDefaultPort(type: DatabaseType): number | undefined {
  switch (type) {
    case 'mysql':
      return 3306;
    case 'postgres':
      return 5432;
    case 'cockroachdb':
      return 26257;
    case 'sap':
      return 39015;
    case 'mariadb':
      return 3306;
    case 'oracle':
      return 1521;
    case 'mssql':
      return 1433;
    case 'mongodb':
      return 27017;
    case 'sqlite':
    case 'cordova':
    case 'react-native':
    case 'nativescript':
    case 'expo':
    case 'better-sqlite3':
    case 'capacitor':
    case 'sqljs':
    default:
      return void 0;
  }
}

export function getConnectionAttributes(
  options: DataSourceOptions,
): Attributes {
  if (sqliteFamily.includes(options.type)) {
    return {
      [SemanticAttributes.DB_SYSTEM]: DbSystemValues.SQLITE,
      [SemanticAttributes.DB_CONNECTION_STRING]:
        typeof options.database === 'string'
          ? options.database
          : DbSystemValues.CACHE,
    };
  } else if (!sqliteFamily.concat(auroraFamily).includes(options.type)) {
    const connectionOptions = options as any;
    let host: string | undefined = connectionOptions.host || 'localhost';
    let port: number | undefined =
      connectionOptions.port || getDefaultPort(options.type);
    let user: string | undefined = connectionOptions.username;
    let database =
      typeof options.database === 'string' ? options.database : void 0;
    if (connectionOptions.url) {
      const url = new URL(connectionOptions.url);
      port = Number(url.port) || port;
      host = url.hostname;
      user = url.username;
      database = url.pathname.slice(1) || database;
    }
    return {
      [SemanticAttributes.DB_SYSTEM]: getDbSystemValue(options),
      [SemanticAttributes.DB_CONNECTION_STRING]: `${options.type}://${
        user ? `${user}@` : ''
      }${host}:${port}${database ? `/${database}` : ''}`,
      [SemanticAttributes.NET_PEER_NAME]: host,
      [SemanticAttributes.NET_PEER_PORT]: port,
      [SemanticAttributes.DB_USER]: user,
      [SemanticAttributes.DB_NAME]: database,
    };
  }
  return {
    [SemanticAttributes.DB_SYSTEM]: getDbSystemValue(options),
    [SemanticAttributes.DB_NAME]:
      typeof options.database === 'string' ? options.database : void 0,
  };
}

const attributeCache = new Map<DataSource, Attributes>();
function getSemanticAttributes(dataSource: DataSource): Attributes {
  if (!attributeCache.has(dataSource)) {
    const options = dataSource.options;
    const attributes = getConnectionAttributes(options);
    attributeCache.set(dataSource, attributes);
  }
  return attributeCache.get(dataSource)!;
}

@Injectable()
export class TypeormInjector extends BaseInjector {
  private readonly logger = new Logger(TypeormInjector.name);
  private readonly config: TypeormInjectorOptions;
  constructor(
    modulesContainer: ModulesContainer,
    @Inject(SDK_CONFIG)
    config: OpenTelemetryModuleConfig,
  ) {
    super(modulesContainer);
    if (config.injectorsConfig?.[TypeormInjector.name])
      this.config = config.injectorsConfig[
        TypeormInjector.name
      ] as TypeormInjectorOptions;
    else this.config = {};
  }

  public inject(): void {
    this.injectQueryRunner();
    this.injectEntityManager();
  }

  public injectEntityManager(): void {
    const prototype = this.loadDependencies('EntityManager')?.prototype;
    if (!prototype) return;

    for (const key of entityManagerMethods) {
      if (!this.isAffected(prototype[key])) {
        const name = `TypeORM -> EntityManager -> ${key}`;
        prototype[key] = this.wrap(
          prototype[key],
          name,
          {},
          true,
          ({ args, thisArg }) => {
            const entityManager = thisArg as EntityManager;
            let metadata: EntityMetadata;
            if (usingEntityPersistExecutor.includes(key)) {
              const entityOrTarget = args[0] as
                | EntityTarget<any>
                | object
                | object[];
              let target: EntityTarget<any>;
              if (Array.isArray(entityOrTarget))
                target = entityOrTarget[0].constructor;
              else if (
                typeof entityOrTarget === 'function' ||
                (entityOrTarget as { '@instanceof': Symbol })['@instanceof'] ===
                  Symbol.for('EntitySchema')
              )
                target = entityOrTarget as EntityTarget<any>;
              else
                target =
                  typeof entityOrTarget === 'string'
                    ? entityOrTarget
                    : entityOrTarget.constructor;
              metadata = entityManager.connection.getMetadata(target);
            } else {
              metadata = entityManager.connection.getMetadata(
                args[0] as EntityTarget<any>,
              );
            }
            return {
              [SemanticAttributes.DB_NAME]:
                metadata.schema ?? metadata.database,
              [SemanticAttributes.DB_SQL_TABLE]: metadata.tableName,
              ...getSemanticAttributes(entityManager.connection),
            };
          },
        );
        this.logger.log(`Mapped ${name}`);
      }
    }
  }

  private injectQueryRunner(): void {
    fg.sync('typeorm/driver/*/*.js', { cwd: 'node_modules' })
      .filter((f) => f.includes('QueryRunner'))
      .forEach((filePath) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
        const moduleExports = require(filePath);
        const [, queryRunner] =
          Object.entries<Type<QueryRunner>>(moduleExports).find(
            ([name, type]) =>
              name.includes('QueryRunner') && typeof type === 'function',
          ) ?? [];
        if (!queryRunner) return;
        const prototype = queryRunner.prototype;
        if (prototype.query === undefined) return;

        prototype.query = this.wrap(
          prototype.query,
          'TypeORM -> raw query',
          {
            kind: SpanKind.CLIENT,
          },
          true,
          ({ args, thisArg, parentSpan }) => {
            const runner = thisArg as QueryRunner;
            const parentAttributes =
              parentSpan instanceof Span ? parentSpan.attributes : {};
            const statement = args[0] as string;
            const operation = statement.trim().split(' ')[0].toUpperCase();
            const span = trace.getSpan(context.active());
            span?.updateName(`TypeORM -> ${operation}`);
            const attributes = {
              [SemanticAttributes.DB_STATEMENT]: args[0] as string,
              [SemanticAttributes.DB_NAME]:
                parentAttributes[SemanticAttributes.DB_NAME],
              [SemanticAttributes.DB_SQL_TABLE]:
                parentAttributes[SemanticAttributes.DB_SQL_TABLE],
              [SemanticAttributes.DB_OPERATION]: operation,
              ...getSemanticAttributes(runner.connection),
            };
            if (this.config.collectParameters) {
              try {
                attributes[DB_STATEMENT_PARAMETERS] = JSON.stringify(args[1]);
              } catch (e) {}
            }
            return attributes;
          },
        );
        this.logger.log(`Mapped ${queryRunner.name}`);
      });
  }

  private loadDependencies<T extends keyof typeof import('typeorm/index.js')>(
    key: T,
  ): Type<typeof import('typeorm/index.js')[T]> | undefined {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
      return require('typeorm')[key];
    } catch (e) {
      this.logger.warn(
        'typeorm is not installed, TypeormInjector will be disabled.',
      );
      return void 0;
    }
  }
}
