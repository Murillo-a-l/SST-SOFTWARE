#!/bin/bash

echo "🚀 Ocupalli - Gerando todos os módulos automaticamente..."
echo ""

# Auth
echo "📦 Gerando AuthModule..."
nest g module modules/auth --no-spec
nest g controller modules/auth --no-spec
nest g service modules/auth --no-spec
mkdir -p src/modules/auth/strategies
mkdir -p src/modules/auth/dto

# User
echo "📦 Gerando UserModule..."
nest g module modules/user --no-spec
nest g controller modules/user --no-spec
nest g service modules/user --no-spec
mkdir -p src/modules/user/dto

# Company
echo "📦 Gerando CompanyModule..."
nest g module modules/company --no-spec
nest g controller modules/company --no-spec
nest g service modules/company --no-spec
mkdir -p src/modules/company/dto

# Worker
echo "📦 Gerando WorkerModule..."
nest g module modules/worker --no-spec
nest g controller modules/worker --no-spec
nest g service modules/worker --no-spec
mkdir -p src/modules/worker/dto

# Job
echo "📦 Gerando JobModule..."
nest g module modules/job --no-spec
nest g controller modules/job --no-spec
nest g service modules/job --no-spec
mkdir -p src/modules/job/dto

# Employment
echo "📦 Gerando EmploymentModule..."
nest g module modules/employment --no-spec
nest g controller modules/employment --no-spec
nest g service modules/employment --no-spec
mkdir -p src/modules/employment/dto

# Procedure
echo "📦 Gerando ProcedureModule..."
nest g module modules/procedure --no-spec
nest g controller modules/procedure --no-spec
nest g service modules/procedure --no-spec
mkdir -p src/modules/procedure/dto

# Appointment
echo "📦 Gerando AppointmentModule..."
nest g module modules/appointment --no-spec
nest g controller modules/appointment --no-spec
nest g service modules/appointment --no-spec
mkdir -p src/modules/appointment/dto

# Document
echo "📦 Gerando DocumentModule..."
nest g module modules/document --no-spec
nest g controller modules/document --no-spec
nest g service modules/document --no-spec
mkdir -p src/modules/document/dto

# File
echo "📦 Gerando FileModule..."
nest g module modules/file --no-spec
nest g controller modules/file --no-spec
nest g service modules/file --no-spec
mkdir -p src/modules/file/dto

# Clinic Unit
echo "📦 Gerando ClinicUnitModule..."
nest g module modules/clinic-unit --no-spec
nest g controller modules/clinic-unit --no-spec
nest g service modules/clinic-unit --no-spec
mkdir -p src/modules/clinic-unit/dto

# Room
echo "📦 Gerando RoomModule..."
nest g module modules/room --no-spec
nest g controller modules/room --no-spec
nest g service modules/room --no-spec
mkdir -p src/modules/room/dto

echo ""
echo "✅ Todos os módulos foram gerados com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Implementar DTOs (create, update) em cada pasta dto/"
echo "2. Implementar lógica nos Services"
echo "3. Implementar rotas nos Controllers"
echo "4. Adicionar validações e Swagger decorators"
echo ""
echo "💡 Use os exemplos do README.md como referência!"
