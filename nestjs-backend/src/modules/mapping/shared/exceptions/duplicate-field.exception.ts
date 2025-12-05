import { ConflictException } from '@nestjs/common';

export class DuplicateFieldException extends ConflictException {
  constructor(field: string, value: string) {
    super({
      success: false,
      error: {
        code: 'DUPLICATE_FIELD',
        message: `Já existe um registro com ${field} = "${value}"`,
        field,
        value,
      },
    });
  }
}



