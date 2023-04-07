import {
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class StandardValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  constructor(options: ValidationPipeOptions = {}) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: false,
      validateCustomDecorators: true,
      ...options,
    });
  }
}
