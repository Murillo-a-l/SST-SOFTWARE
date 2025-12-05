import { BadRequestException } from '@nestjs/common';

export class CannotDeleteDependencyException extends BadRequestException {
  constructor(entity: string, dependentCount: number, dependentEntity: string) {
    super({
      success: false,
      error: {
        code: 'CANNOT_DELETE_DEPENDENCY',
        message: `Não é possível excluir ${entity} pois existem ${dependentCount} ${dependentEntity} vinculados`,
        entity,
        dependentCount,
        dependentEntity,
      },
    });
  }
}



