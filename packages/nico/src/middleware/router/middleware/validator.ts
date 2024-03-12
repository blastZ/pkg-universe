import path from 'node:path';

import { type File } from 'formidable';
import Joi from 'joi';

import { Context, Next } from '../../../interfaces/index.js';

export type Validator = (data: any) => { [key: string]: any };

export type FilesValidator = Joi.Schema | Validator;

export type Validate = {
  params?: Joi.ObjectSchema | Validator;
  query?: Joi.ObjectSchema | Validator;
  body?: Joi.ObjectSchema | Joi.Schema | Validator;
  files?: {
    [key: string]: {
      size?: FilesValidator;
      name?: FilesValidator;
      basename?: FilesValidator;
      extname?: FilesValidator;
      type?: FilesValidator;
    };
  };
};

type FileValidateKey = 'size' | 'name' | 'basename' | 'extname' | 'type';

export default function getValidatorMiddleware(validate: Validate) {
  const stage = `nico.routeMiddleware.validator`;

  return async function validatorMiddleware(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({ stage });
    const validateErrors: Error[] = [];

    await Promise.all(
      Object.keys(validate).map(async (key) => {
        const logger = ctx.logger.child({ stage: `${stage}.${key}` });

        if (
          key !== 'params' &&
          key !== 'query' &&
          key !== 'body' &&
          key !== 'files'
        ) {
          const message = `"${key}" is not a vlidate key`;
          logger.error(message);
          throw new Error(message);
        }

        const data = key === 'params' ? ctx.params : ctx.request[key];

        if (key === 'params' || key === 'query' || key === 'body') {
          const validator = validate[key];

          let value = {};

          try {
            if (typeof validator === 'function') {
              value = await validator(data);
            } else if (
              typeof validator === 'object' &&
              validator.validateAsync
            ) {
              value = await validator.validateAsync(data);
            }
          } catch (err: any) {
            logger.error(err);
            validateErrors.push(err);
            return;
          }

          logger.trace({ origin: data, parsed: value });

          ctx.state[key] = value;
        } else if (key === 'files') {
          const files = validate.files || {};

          await Promise.all(
            Object.keys(files).map(async (optionalFileKey) => {
              let allowNull = false;
              let fileKey = optionalFileKey;

              if (optionalFileKey.endsWith('?')) {
                fileKey = optionalFileKey.slice(0, -1);
                allowNull = true;
              }

              const fileList = ctx.request?.files?.[fileKey];

              if (!fileList || fileList.length < 1) {
                if (allowNull) return;

                const message = `"${fileKey}" is required`;
                logger.error(message);
                validateErrors.push(new Error(message));

                return;
              }

              if (fileList.length > 1) {
                // TODO support multiple file validate
                const message = `"${fileKey}" include multiple files`;
                logger.error(message);
                validateErrors.push(new Error(message));

                return;
              }

              logger.trace({
                files: {
                  [fileKey]: filterFileData(fileList),
                },
              });

              const fileValidateSchema = files[optionalFileKey];

              await Promise.all(
                Object.keys(fileValidateSchema).map(async (fileValidateKey) => {
                  if (
                    !['size', 'name', 'basename', 'extname', 'type'].includes(
                      fileValidateKey,
                    )
                  ) {
                    const message = `"${fileValidateKey}" is not a valid key`;
                    logger.error(message);
                    throw new Error(message);
                  }

                  const validator =
                    fileValidateSchema[fileValidateKey as FileValidateKey];

                  async function validateFile(theData: any) {
                    try {
                      if (!validator) return;

                      if (typeof validator === 'function') {
                        validator(theData);
                      } else if (validator.validateAsync) {
                        await validator.validateAsync(theData);
                      }
                    } catch (err: any) {
                      logger.error(err);
                      validateErrors.push(err);
                    }
                  }

                  if (fileValidateKey === 'basename') {
                    await validateFile(
                      path.basename(
                        fileList[0].originalFilename ?? '',
                        path.extname(fileList[0].originalFilename ?? ''),
                      ),
                    );
                  } else if (fileValidateKey === 'extname') {
                    await validateFile(
                      path.extname(fileList[0].originalFilename ?? ''),
                    );
                  } else if (fileValidateKey === 'type') {
                    await validateFile(fileList[0].mimetype);
                  } else if (fileValidateKey === 'name') {
                    await validateFile(fileList[0].originalFilename);
                  } else {
                    await validateFile((fileList[0] as any)[fileValidateKey]);
                  }
                }),
              );
            }),
          );

          ctx.state.files = ctx.request.files;
        }
      }),
    );

    if (validateErrors.length > 0) {
      if (ctx.onValidateError) {
        return ctx.onValidateError(validateErrors[0]);
      }

      ctx.status = 400;
      ctx.body = validateErrors[0].message;
      return;
    }

    await next();
  };
}

function filterFileData(fileList: File[]) {
  return {
    name: fileList[0]!.originalFilename,
    path: fileList[0]!.filepath,
    size: fileList[0]!.size,
    type: fileList[0]!.mimetype,
    lastModifiedDate: (fileList[0] as any)!.lastModifiedDate,
  };
}
