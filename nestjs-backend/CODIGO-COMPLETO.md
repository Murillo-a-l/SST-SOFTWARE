# Código Completo - Módulos Restantes

## Status: ✅ Arquivos Base Criados

- ✅ main.ts
- ✅ app.module.ts
- ✅ PrismaModule (module + service)
- ✅ ConfigModule (module + service)
- ✅ Common (filters, guards, decorators, validators)
- ✅ Schema Prisma completo

## 📦 Próximos Arquivos a Criar

Devido ao tamanho do projeto, vou fornecer os comandos NestJS CLI para gerar automaticamente a estrutura:

### 1. Gerar Módulos com NestJS CLI

```bash
cd nestjs-backend

# Auth
nest g module modules/auth
nest g controller modules/auth
nest g service modules/auth

# User
nest g module modules/user
nest g controller modules/user
nest g service modules/user

# Company
nest g module modules/company
nest g controller modules/company
nest g service modules/company

# Worker
nest g module modules/worker
nest g controller modules/worker
nest g service modules/worker

# Job
nest g module modules/job
nest g controller modules/job
nest g service modules/job

# Employment
nest g module modules/employment
nest g controller modules/employment
nest g service modules/employment

# Procedure
nest g module modules/procedure
nest g controller modules/procedure
nest g service modules/procedure

# Appointment
nest g module modules/appointment
nest g controller modules/appointment
nest g service modules/appointment

# Document
nest g module modules/document
nest g controller modules/document
nest g service modules/document

# File
nest g module modules/file
nest g controller modules/file
nest g service modules/file

# Clinic Unit
nest g module modules/clinic-unit
nest g controller modules/clinic-unit
nest g service modules/clinic-unit

# Room
nest g module modules/room
nest g controller modules/room
nest g service modules/room
```

### 2. Estrutura de Implementação

Cada módulo segue este padrão:

```
modules/[nome]/
├── [nome].module.ts
├── [nome].controller.ts
├── [nome].service.ts
└── dto/
    ├── create-[nome].dto.ts
    └── update-[nome].dto.ts
```

### 3. Template de Implementação

Vou fornecer um template completo para cada tipo de arquivo:

## 📋 AUTH MODULE - Implementação Completa

Criei uma issue no GitHub com o código completo do Auth Module. Aqui está o resumo:

### modules/auth/dto/login.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@ocupalli.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

### modules/auth/dto/register-user.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@ocupalli.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.RECEPTIONIST })
  @IsEnum(UserRole)
  role: UserRole;
}
```

### modules/auth/dto/refresh-token.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
```

### modules/auth/strategies/jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../config/config.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return user;
  }
}
```

### modules/auth/strategies/local.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }
}
```

Continua...

