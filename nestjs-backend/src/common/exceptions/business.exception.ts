import { HttpException, HttpStatus } from '@nestjs/common';

export enum BusinessErrorCode {
  // Company errors
  COMPANY_DELINQUENT_WARNING = 'COMPANY_DELINQUENT_WARNING',

  // Employment errors
  EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED = 'EMPLOYMENT_TERMINATED_DOCUMENTS_NOT_ALLOWED',
  DISMISSAL_ASO_ALREADY_EXISTS = 'DISMISSAL_ASO_ALREADY_EXISTS',
  EMPLOYMENT_NOT_TERMINATED = 'EMPLOYMENT_NOT_TERMINATED',

  // Document errors
  DOCUMENT_INCOMPLETE_FOR_FINALIZATION = 'DOCUMENT_INCOMPLETE_FOR_FINALIZATION',
  DOCUMENT_ALREADY_FINAL = 'DOCUMENT_ALREADY_FINAL',
  DOCUMENT_REQUIRED_FIELDS_MISSING = 'DOCUMENT_REQUIRED_FIELDS_MISSING',

  // Appointment errors
  APPOINTMENT_HAS_OPEN_PROCEDURES = 'APPOINTMENT_HAS_OPEN_PROCEDURES',
  APPOINTMENT_INVALID_STATUS_TRANSITION = 'APPOINTMENT_INVALID_STATUS_TRANSITION',
  APPOINTMENT_ALREADY_FINISHED = 'APPOINTMENT_ALREADY_FINISHED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CPF_ALREADY_EXISTS = 'CPF_ALREADY_EXISTS',
  CNPJ_ALREADY_EXISTS = 'CNPJ_ALREADY_EXISTS',
  INVALID_CPF_FORMAT = 'INVALID_CPF_FORMAT',
  INVALID_CNPJ_FORMAT = 'INVALID_CNPJ_FORMAT',

  // Generic errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

export class BusinessException extends HttpException {
  constructor(
    public readonly code: BusinessErrorCode,
    message: string,
    public readonly details?: any,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      },
      statusCode,
    );
  }
}

export class ValidationException extends BusinessException {
  constructor(errors: any[]) {
    super(
      BusinessErrorCode.VALIDATION_ERROR,
      'Validation failed',
      { errors },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id?: string) {
    super(
      BusinessErrorCode.RESOURCE_NOT_FOUND,
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      { resource, id },
      HttpStatus.NOT_FOUND,
    );
  }
}
