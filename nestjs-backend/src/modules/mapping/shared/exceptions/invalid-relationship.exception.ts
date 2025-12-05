import { BadRequestException } from '@nestjs/common';

export class InvalidRelationshipException extends BadRequestException {
  constructor(message: string) {
    super({
      success: false,
      error: {
        code: 'INVALID_RELATIONSHIP',
        message,
      },
    });
  }
}



