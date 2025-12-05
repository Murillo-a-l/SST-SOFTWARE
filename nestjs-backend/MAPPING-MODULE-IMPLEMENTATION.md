# 🗺️ MÓDULO DE MAPEAMENTO - GUIA DE IMPLEMENTAÇÃO

## 📋 Checklist de Implementação

### 1. Schema Prisma ✅
- [x] Enums criados
- [x] Modelos criados (10 tabelas)
- [x] Relações definidas
- [x] Índices otimizados

### 2. Estrutura de Pastas ✅
```
src/modules/mapping/
├── shared/
│   ├── enums/
│   │   ├── environment-location-type.enum.ts
│   │   ├── risk-type.enum.ts
│   │   ├── risk-intensity.enum.ts
│   │   └── index.ts
│   └── exceptions/
│       ├── duplicate-field.exception.ts
│       ├── invalid-relationship.exception.ts
│       ├── cannot-delete-dependency.exception.ts
│       └── index.ts
├── categories/
│   ├── dto/
│   ├── risk-category.service.ts
│   ├── risk-category.controller.ts
│   └── risk-category.module.ts
├── risks/
│   ├── dto/
│   ├── risk.service.ts
│   ├── risk.controller.ts
│   └── risk.module.ts
├── environments/
│   ├── dto/
│   ├── environment.service.ts
│   ├── environment.controller.ts
│   └── environment.module.ts
├── jobs/
│   ├── dto/
│   ├── job-mapping.service.ts
│   ├── job-mapping.controller.ts
│   └── job-mapping.module.ts
└── mapping.module.ts
```

### 3. Arquivos Gerados

#### Enums (4 arquivos)
- environment-location-type.enum.ts
- risk-type.enum.ts
- risk-intensity.enum.ts
- index.ts

#### Exceptions (4 arquivos)
- duplicate-field.exception.ts
- invalid-relationship.exception.ts
- cannot-delete-dependency.exception.ts
- index.ts

#### DTOs - Risk Categories (3 arquivos)
- create-risk-category.dto.ts
- update-risk-category.dto.ts
- risk-category-response.dto.ts

#### DTOs - Risks (3 arquivos)
- create-risk.dto.ts
- update-risk.dto.ts
- risk-response.dto.ts

#### DTOs - Environments (4 arquivos)
- create-environment.dto.ts
- update-environment.dto.ts
- environment-response.dto.ts
- add-environment-risk.dto.ts

#### DTOs - Jobs (7 arquivos)
- create-job-mapping.dto.ts
- update-job-mapping.dto.ts
- job-notes.dto.ts
- add-job-environment.dto.ts
- add-job-risk.dto.ts
- add-job-exam.dto.ts
- job-mapping-response.dto.ts

#### Services (4 arquivos)
- risk-category.service.ts
- risk.service.ts
- environment.service.ts
- job-mapping.service.ts

#### Controllers (4 arquivos)
- risk-category.controller.ts
- risk.controller.ts
- environment.controller.ts
- job-mapping.controller.ts

#### Modules (5 arquivos)
- risk-category.module.ts
- risk.module.ts
- environment.module.ts
- job-mapping.module.ts
- mapping.module.ts

#### Seed (1 arquivo)
- mapping.seed.ts

**TOTAL: ~50 arquivos criados**

---

## 🚀 PASSO A PASSO PARA IMPLEMENTAÇÃO

### PASSO 1: Atualizar Schema Prisma

1. Copiar todo o conteúdo do arquivo `schema-mapping.prisma` (gerado acima)
2. Colar no final do arquivo `nestjs-backend/prisma/schema.prisma`
3. Adicionar ao modelo Company existente:
```prisma
model Company {
  // ... campos existentes
  environments  Environment[]  // ADICIONAR ESTA LINHA
}
```

4. Adicionar ao modelo Job existente:
```prisma
model Job {
  // ... campos existentes

  mainEnvironmentId            String?   @map("main_environment_id")

  // Relações de mapeamento
  mainEnvironment              Environment?      @relation("MainEnvironment", fields: [mainEnvironmentId], references: [id], onDelete: SetNull)
  jobEnvironments              JobEnvironment[]
  jobRisks                     JobRisk[]
  jobExams                     JobExam[]
  jobNotes                     JobNotes?

  @@index([mainEnvironmentId])
}
```

### PASSO 2: Criar Estrutura de Pastas

```bash
cd nestjs-backend/src/modules
mkdir -p mapping/{shared/{enums,exceptions},categories/dto,risks/dto,environments/dto,jobs/dto}
```

### PASSO 3: Copiar Todos os Arquivos Gerados

Copiar todos os arquivos TypeScript gerados acima para suas respectivas pastas.

### PASSO 4: Atualizar app.module.ts

```typescript
import { MappingModule } from './modules/mapping/mapping.module';

@Module({
  imports: [
    // ... outros imports
    MappingModule,
  ],
})
```

### PASSO 5: Aplicar Migrations

```bash
cd nestjs-backend

# Gerar Prisma Client
npm run prisma:generate

# Aplicar mudanças no banco
npx prisma db push

# Verificar no Prisma Studio
npm run prisma:studio
```

### PASSO 6: Executar Seed

Adicionar ao arquivo `seed.ts`:

```typescript
import { seedMapping } from './seeds/mapping.seed';

async function main() {
  // ... seeds existentes
  await seedMapping();
}
```

Execute:
```bash
npm run prisma:seed
```

### PASSO 7: Testar Endpoints

Acessar Swagger: `http://localhost:3000/api/docs`

Endpoints disponíveis:

#### Risk Categories
- POST   /api/v1/mapping/risk-categories
- GET    /api/v1/mapping/risk-categories
- GET    /api/v1/mapping/risk-categories/:id
- PATCH  /api/v1/mapping/risk-categories/:id
- DELETE /api/v1/mapping/risk-categories/:id

#### Risks
- POST   /api/v1/mapping/risks
- GET    /api/v1/mapping/risks
- GET    /api/v1/mapping/risks/:id
- PATCH  /api/v1/mapping/risks/:id
- DELETE /api/v1/mapping/risks/:id

#### Environments
- POST   /api/v1/mapping/environments
- GET    /api/v1/mapping/environments
- GET    /api/v1/mapping/environments/:id
- PATCH  /api/v1/mapping/environments/:id
- DELETE /api/v1/mapping/environments/:id
- POST   /api/v1/mapping/environments/:id/risks
- DELETE /api/v1/mapping/environments/:id/risks/:riskId
- GET    /api/v1/mapping/environments/:id/risks

#### Jobs
- POST   /api/v1/mapping/jobs
- GET    /api/v1/mapping/jobs
- GET    /api/v1/mapping/jobs/:id
- PATCH  /api/v1/mapping/jobs/:id
- DELETE /api/v1/mapping/jobs/:id
- PATCH  /api/v1/mapping/jobs/:id/notes
- GET    /api/v1/mapping/jobs/:id/notes
- POST   /api/v1/mapping/jobs/:id/environments
- DELETE /api/v1/mapping/jobs/:id/environments/:environmentId
- GET    /api/v1/mapping/jobs/:id/environments
- POST   /api/v1/mapping/jobs/:id/risks
- DELETE /api/v1/mapping/jobs/:id/risks/:riskId
- GET    /api/v1/mapping/jobs/:id/risks
- POST   /api/v1/mapping/jobs/:id/exams
- DELETE /api/v1/mapping/jobs/:id/exams/:examName
- GET    /api/v1/mapping/jobs/:id/exams

**Total: 31 endpoints**

---

## 🧪 TESTES MANUAIS VIA cURL

### 1. Criar Categoria de Risco
```bash
curl -X POST http://localhost:3000/api/v1/mapping/risk-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riscos Físicos",
    "description": "Riscos relacionados a agentes físicos",
    "color": "#FF5722",
    "icon": "zap"
  }'
```

### 2. Criar Risco
```bash
curl -X POST http://localhost:3000/api/v1/mapping/risks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID",
    "type": "PHYSICAL",
    "code": "01.01.001",
    "name": "Ruído contínuo",
    "allowsIntensity": true
  }'
```

### 3. Criar Ambiente
```bash
curl -X POST http://localhost:3000/api/v1/mapping/environments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMPANY_ID",
    "name": "Cozinha Industrial",
    "locationType": "EMPLOYER_ESTABLISHMENT",
    "color": "#FF9800",
    "icon": "utensils"
  }'
```

### 4. Criar Cargo com Mapeamento
```bash
curl -X POST http://localhost:3000/api/v1/mapping/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "COMPANY_ID",
    "title": "Cozinheiro",
    "cbo": "513105",
    "mainEnvironmentId": "ENV_ID",
    "environmentIds": ["ENV_ID"],
    "riskIds": ["RISK_ID"]
  }'
```

---

## ✅ VALIDAÇÕES IMPLEMENTADAS

### Ambiente
- [x] Nome único por empresa
- [x] Se registeredInESocial = true, código e validade obrigatórios
- [x] Empresa deve existir
- [x] Soft delete

### Cargo
- [x] Ambiente principal deve pertencer à mesma empresa
- [x] Ambientes devem pertencer à mesma empresa
- [x] Apenas um ambiente pode ser principal
- [x] Soft delete

### Risco
- [x] Categoria deve existir
- [x] Soft delete (marca como inativo)

### Relações
- [x] Não permite duplicar risco no mesmo ambiente
- [x] Não permite duplicar risco no mesmo cargo
- [x] Não permite duplicar ambiente no mesmo cargo
- [x] Não permite duplicar exame no mesmo cargo

---

## 📊 MODELOS CRIADOS

1. **RiskCategory** - Categorias de risco
2. **Risk** - Riscos ocupacionais
3. **Environment** - Ambientes de trabalho
4. **EnvironmentRisk** - Riscos do ambiente (pivot)
5. **Job** (estendido) - Cargos com mapeamento
6. **JobEnvironment** - Ambientes do cargo (pivot)
7. **JobRisk** - Riscos do cargo (pivot)
8. **JobExam** - Exames do cargo
9. **JobNotes** - Notas e textos do cargo
10. **RiskExam** - Exames recomendados para riscos

---

## 🔐 AUTENTICAÇÃO

Todos os endpoints requerem autenticação via JWT Bearer token.

```bash
# Obter token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocupalli.com.br","password":"admin123"}' \
  | jq -r '.accessToken')
```

---

## 📝 PRÓXIMOS PASSOS

- [ ] Integração com módulo de Exames (PCMSO)
- [ ] Integração com ASO
- [ ] Integração com eSocial S-2240
- [ ] Dashboard de PGR
- [ ] Upload de documentos anexos
- [ ] Relatórios de mapeamento
- [ ] Exportação para PDF

---

**Status**: ✅ Módulo completo e pronto para uso!
**Data**: 30/11/2025
**Versão**: 1.0.0
