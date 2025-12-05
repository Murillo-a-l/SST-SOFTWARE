# Guia de Implementação Completo - Ocupalli Backend

Este documento contém a implementação completa de todos os módulos principais do sistema.

## 📁 Estrutura de Diretórios Completa

```
nestjs-backend/
├── prisma/
│   ├── schema.prisma                    ✅ CRIADO
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   └── config.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── exceptions/
│   │   │   └── business.exception.ts    ✅ CRIADO
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── response.interceptor.ts
│   │   ├── dto/
│   │   │   └── pagination-query.dto.ts
│   │   └── validators/
│   │       ├── cpf.validator.ts
│   │       └── cnpj.validator.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       ├── register-user.dto.ts
│       │       └── refresh-token.dto.ts
│       ├── user/
│       │   ├── user.module.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       └── update-user.dto.ts
│       ├── company/
│       │   ├── company.module.ts
│       │   ├── company.controller.ts
│       │   ├── company.service.ts
│       │   └── dto/
│       │       ├── create-company.dto.ts
│       │       └── update-company.dto.ts
│       ├── worker/
│       │   ├── worker.module.ts
│       │   ├── worker.controller.ts
│       │   ├── worker.service.ts
│       │   └── dto/
│       │       ├── create-worker.dto.ts
│       │       └── update-worker.dto.ts
│       ├── job/
│       │   ├── job.module.ts
│       │   ├── job.controller.ts
│       │   ├── job.service.ts
│       │   └── dto/
│       │       ├── create-job.dto.ts
│       │       └── update-job.dto.ts
│       ├── employment/
│       │   ├── employment.module.ts
│       │   ├── employment.controller.ts
│       │   ├── employment.service.ts
│       │   └── dto/
│       │       ├── create-employment.dto.ts
│       │       └── update-employment.dto.ts
│       ├── procedure/
│       │   ├── procedure.module.ts
│       │   ├── procedure.controller.ts
│       │   ├── procedure.service.ts
│       │   └── dto/
│       │       ├── create-procedure.dto.ts
│       │       └── update-procedure.dto.ts
│       ├── appointment/
│       │   ├── appointment.module.ts
│       │   ├── appointment.controller.ts
│       │   ├── appointment.service.ts
│       │   ├── waiting-room.controller.ts
│       │   └── dto/
│       │       ├── create-appointment.dto.ts
│       │       ├── update-appointment.dto.ts
│       │       ├── update-status.dto.ts
│       │       └── update-procedure.dto.ts
│       ├── document/
│       │   ├── document.module.ts
│       │   ├── document.controller.ts
│       │   ├── document.service.ts
│       │   └── dto/
│       │       ├── create-document.dto.ts
│       │       ├── update-document.dto.ts
│       │       └── finalize-document.dto.ts
│       ├── file/
│       │   ├── file.module.ts
│       │   ├── file.controller.ts
│       │   ├── file.service.ts
│       │   └── dto/
│       │       └── upload-file.dto.ts
│       ├── clinic-unit/
│       │   ├── clinic-unit.module.ts
│       │   ├── clinic-unit.controller.ts
│       │   ├── clinic-unit.service.ts
│       │   └── dto/
│       │       ├── create-clinic-unit.dto.ts
│       │       └── update-clinic-unit.dto.ts
│       └── room/
│           ├── room.module.ts
│           ├── room.controller.ts
│           ├── room.service.ts
│           └── dto/
│               ├── create-room.dto.ts
│               └── update-room.dto.ts
├── test/
│   └── app.e2e-spec.ts
├── uploads/                              # Arquivos enviados
├── .env.example                          ✅ CRIADO
├── .gitignore
├── nest-cli.json
├── package.json                          ✅ CRIADO
├── tsconfig.json                         ✅ CRIADO
└── README.md                             ✅ CRIADO
```

## 🔧 Arquivos de Configuração Base

### 1. nest-cli.json
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "webpackConfigPath": "webpack.config.js"
  }
}
```

### 2. .gitignore
```
# compiled output
/dist
/node_modules

# Logs
logs
*.log
npm-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Environment
.env
.env.local
.env.*.local

# Uploads
/uploads

# Prisma
/prisma/migrations
```

## 📝 Implementação dos Módulos Principais

### MÓDULO: Prisma Service

#### prisma/prisma.module.ts
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### prisma/prisma.service.ts
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### MÓDULO: Config

#### config/config.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

#### config/config.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get uploadPath(): string {
    return this.configService.get<string>('UPLOAD_PATH', './uploads');
  }

  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 10485760); // 10MB
  }
}
```

### MÓDULO: Common (Guards, Decorators, Filters)

#### common/filters/http-exception.filter.ts
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'error' in exceptionResponse) {
        // BusinessException format
        error = (exceptionResponse as any).error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = { code: 'HTTP_EXCEPTION', message };
      } else {
        error = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = { code: 'INTERNAL_ERROR', message };
    }

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
    });
  }
}
```

#### common/guards/jwt-auth.guard.ts
```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}
```

#### common/guards/roles.guard.ts
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### common/decorators/roles.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

#### common/decorators/current-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

#### common/decorators/public.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### common/validators/cpf.validator.ts
```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCPFConstraint implements ValidatorConstraintInterface {
  validate(cpf: string) {
    if (!cpf) return false;

    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação dos dígitos verificadores (implementação simplificada)
    // Para produção, usar biblioteca ou implementação completa
    return true;
  }

  defaultMessage() {
    return 'CPF inválido';
  }
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCPFConstraint,
    });
  };
}
```

#### common/validators/cnpj.validator.ts
```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCNPJConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string) {
    if (!cnpj) return false;

    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;

    // Verifica se não são todos iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Validação dos dígitos verificadores (implementação simplificada)
    // Para produção, usar biblioteca ou implementação completa
    return true;
  }

  defaultMessage() {
    return 'CNPJ inválido';
  }
}

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCNPJConstraint,
    });
  };
}
```

## 📝 Próximos Passos

Para implementar o projeto completo:

1. **Instalar dependências:**
```bash
cd nestjs-backend
npm install
```

2. **Configurar banco:**
```bash
# Editar .env
cp .env.example .env

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

3. **Implementar módulos restantes:**
   - Seguir estrutura descrita acima
   - Usar exemplos do README.md
   - Aplicar regras de negócio documentadas

4. **Testar:**
```bash
npm run start:dev
# Acessar http://localhost:3000/api/docs
```

## 📚 Recursos Adicionais

- Documentação NestJS: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- Class Validator: https://github.com/typestack/class-validator
- Swagger NestJS: https://docs.nestjs.com/openapi/introduction

---

**Nota:** Devido ao tamanho do projeto completo, este guia fornece a estrutura e os arquivos principais. Os módulos de negócio (Company, Worker, Employment, Appointment, Document) devem ser implementados seguindo os padrões demonstrados nos exemplos do README.md.

Cada módulo segue o padrão:
- Module → Controller → Service → DTOs
- Validações com class-validator
- Regras de negócio no Service
- Tratamento de erros com BusinessException
- Documentação Swagger com decorators

O schema Prisma já está completo e pronto para uso.
