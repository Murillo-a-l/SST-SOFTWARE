# API ESO - Endpoints Completos

Base URL: `http://localhost:3001/api`

## Autenticação

Todas as rotas (exceto login) requerem header:
```
Authorization: Bearer <TOKEN>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nome": "Administrador",
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

---

## 1. Company (Empresa)

### 1.1 Listar Empresas
```http
GET /company
Authorization: Bearer <TOKEN>
```

### 1.2 Buscar Empresa por ID
```http
GET /company/:id
Authorization: Bearer <TOKEN>
```

### 1.3 Criar Empresa
```http
POST /company
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "razaoSocial": "Acme Corporation Ltda",      // obrigatório
  "nomeFantasia": "Acme Corp",                  // opcional
  "cnpj": "12345678000190",                     // obrigatório, 14 dígitos
  "cnae": "8640201",                            // opcional
  "grauRisco": 2,                               // opcional, 1-4
  "email": "contato@acme.com",                  // opcional
  "telefone": "11999999999",                    // opcional
  "cep": "01310100",                            // opcional
  "logradouro": "Av Paulista",                  // opcional
  "numero": "1000",                             // opcional
  "bairro": "Bela Vista",                       // opcional
  "cidade": "São Paulo",                        // opcional
  "estado": "SP",                               // opcional, 2 caracteres
  "observacoes": "Empresa principal",           // opcional
  "matriz": true,                               // default: true
  "empresaMatrizId": null                       // UUID da matriz (se for filial)
}
```

### 1.4 Atualizar Empresa
```http
PUT /company/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nomeFantasia": "Acme Corporation",
  "email": "novo@acme.com"
}
```

### 1.5 Deletar Empresa
```http
DELETE /company/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver cargos, ambientes ou vínculos**

### 1.6 Listar Filiais de uma Matriz
```http
GET /company/:id/filiais
Authorization: Bearer <TOKEN>
```

### 1.7 Listar Cargos de uma Empresa
```http
GET /company/:id/cargos
Authorization: Bearer <TOKEN>
```

### 1.8 Listar Ambientes de uma Empresa
```http
GET /company/:id/ambientes
Authorization: Bearer <TOKEN>
```

### 1.9 Listar Pessoas Vinculadas a uma Empresa
```http
GET /company/:id/pessoas
Authorization: Bearer <TOKEN>
```

---

## 2. Person (Pessoa)

### 2.1 Listar Pessoas
```http
GET /person
Authorization: Bearer <TOKEN>
```

### 2.2 Buscar Pessoa por ID
```http
GET /person/:id
Authorization: Bearer <TOKEN>
```

### 2.3 Criar Pessoa
```http
POST /person
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "João Silva",                         // obrigatório
  "cpf": "12345678901",                         // obrigatório, 11 dígitos
  "dataNascimento": "1990-05-15",               // opcional, ISO date
  "sexo": "M",                                  // opcional: M, F, Outro
  "telefone": "11988887777",                    // opcional
  "email": "joao@example.com",                  // opcional
  "cep": "01310100",                            // opcional
  "logradouro": "Av Paulista",                  // opcional
  "numero": "1000",                             // opcional
  "bairro": "Bela Vista",                       // opcional
  "cidade": "São Paulo",                        // opcional
  "estado": "SP",                               // opcional, 2 caracteres
  "observacoes": "Funcionário antigo"           // opcional
}
```

### 2.4 Atualizar Pessoa
```http
PUT /person/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "telefone": "11999998888",
  "email": "joao.novo@example.com"
}
```

### 2.5 Deletar Pessoa
```http
DELETE /person/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver vínculos ativos**

### 2.6 Listar Vínculos de uma Pessoa
```http
GET /person/:id/vinculos
Authorization: Bearer <TOKEN>
```

---

## 3. Cargo

### 3.1 Listar Cargos
```http
GET /cargo
Authorization: Bearer <TOKEN>

# Filtrar por empresa:
GET /cargo?empresaId=<UUID>
```

### 3.2 Buscar Cargo por ID
```http
GET /cargo/:id
Authorization: Bearer <TOKEN>
```

**Retorna cargo com riscos, exames e ambientes vinculados**

### 3.3 Criar Cargo
```http
POST /cargo
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Operador de Máquinas",               // obrigatório
  "cbo": "841405",                              // opcional
  "descricao": "Opera máquinas industriais",    // opcional
  "empresaId": "<UUID>"                         // obrigatório
}
```

### 3.4 Atualizar Cargo
```http
PUT /cargo/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Operador de Máquinas Sênior",
  "descricao": "Atualizada"
}
```

### 3.5 Deletar Cargo
```http
DELETE /cargo/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver vínculos**

### 3.6 Adicionar Risco ao Cargo
```http
POST /cargo/:id/riscos
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "riscoId": "<UUID>"
}
```

### 3.7 Remover Risco do Cargo
```http
DELETE /cargo/:id/riscos/:riscoId
Authorization: Bearer <TOKEN>
```

### 3.8 Adicionar Exame ao Cargo
```http
POST /cargo/:id/exames
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "exameId": "<UUID>"
}
```

### 3.9 Remover Exame do Cargo
```http
DELETE /cargo/:id/exames/:exameId
Authorization: Bearer <TOKEN>
```

### 3.10 Adicionar Ambiente ao Cargo
```http
POST /cargo/:id/ambientes
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "ambienteId": "<UUID>"
}
```

### 3.11 Remover Ambiente do Cargo
```http
DELETE /cargo/:id/ambientes/:ambienteId
Authorization: Bearer <TOKEN>
```

---

## 4. Ambiente

### 4.1 Listar Ambientes
```http
GET /ambiente
Authorization: Bearer <TOKEN>

# Filtrar por empresa:
GET /ambiente?empresaId=<UUID>
```

### 4.2 Buscar Ambiente por ID
```http
GET /ambiente/:id
Authorization: Bearer <TOKEN>
```

### 4.3 Criar Ambiente
```http
POST /ambiente
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Setor de Produção",                  // obrigatório
  "descricao": "Área de produção industrial",   // opcional
  "empresaId": "<UUID>"                         // obrigatório
}
```

### 4.4 Atualizar Ambiente
```http
PUT /ambiente/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Setor de Produção 1",
  "descricao": "Atualizada"
}
```

### 4.5 Deletar Ambiente
```http
DELETE /ambiente/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver cargos vinculados**

---

## 5. Risco (Catálogo Global)

### 5.1 Listar Riscos
```http
GET /risco
Authorization: Bearer <TOKEN>
```

### 5.2 Buscar Risco por ID
```http
GET /risco/:id
Authorization: Bearer <TOKEN>
```

### 5.3 Criar Risco
```http
POST /risco
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Ruído",                                      // obrigatório
  "codigo": "01.01.001",                                // opcional (Tabela 24 eSocial)
  "grupo": "físico",                                    // opcional: físico, químico, biológico, ergonômico, acidente
  "descricao": "Exposição a ruído contínuo"             // opcional
}
```

### 5.4 Atualizar Risco
```http
PUT /risco/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "descricao": "Descrição atualizada"
}
```

### 5.5 Deletar Risco
```http
DELETE /risco/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver cargos vinculados**

---

## 6. Exame (Catálogo Global)

### 6.1 Listar Exames
```http
GET /global-exame
Authorization: Bearer <TOKEN>
```

### 6.2 Buscar Exame por ID
```http
GET /global-exame/:id
Authorization: Bearer <TOKEN>
```

### 6.3 Criar Exame
```http
POST /global-exame
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nome": "Audiometria",                                // obrigatório
  "codigo": "0211010028",                               // opcional (código eSocial)
  "tipo": "complementar",                               // opcional
  "descricao": "Exame de audiometria tonal"             // opcional
}
```

**Tipos:** admissional, periódico, retorno, mudança de risco, demissional

### 6.4 Atualizar Exame
```http
PUT /global-exame/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "descricao": "Descrição atualizada"
}
```

### 6.5 Deletar Exame
```http
DELETE /global-exame/:id
Authorization: Bearer <TOKEN>
```

⚠️ **Bloqueado se houver cargos vinculados**

---

## 7. Vínculo (PessoaCargo)

### 7.1 Listar Vínculos
```http
GET /vinculo
Authorization: Bearer <TOKEN>

# Filtros:
GET /vinculo?empresaId=<UUID>
GET /vinculo?personId=<UUID>
GET /vinculo?ativo=true
GET /vinculo?empresaId=<UUID>&ativo=false
```

### 7.2 Buscar Vínculo por ID
```http
GET /vinculo/:id
Authorization: Bearer <TOKEN>
```

### 7.3 Criar Vínculo
```http
POST /vinculo
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "personId": "<UUID>",                         // obrigatório
  "empresaId": "<UUID>",                        // obrigatório
  "cargoId": "<UUID>",                          // obrigatório
  "ativo": true,                                // default: true
  "dataEntrada": "2025-01-01",                  // opcional, ISO date
  "dataSaida": null                             // opcional, ISO date
}
```

⚠️ **Regra:** Uma pessoa pode ter apenas um vínculo ativo por empresa

### 7.4 Atualizar Vínculo
```http
PUT /vinculo/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "dataEntrada": "2025-01-15"
}
```

### 7.5 Deletar Vínculo
```http
DELETE /vinculo/:id
Authorization: Bearer <TOKEN>
```

### 7.6 Inativar Vínculo
```http
PUT /vinculo/:id/inativar
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "dataSaida": "2025-12-31"                     // opcional, usa data atual se omitido
}
```

### 7.7 Reativar Vínculo
```http
PUT /vinculo/:id/reativar
Authorization: Bearer <TOKEN>
```

⚠️ **Valida se não há outro vínculo ativo na mesma empresa**

---

## Códigos de Status HTTP

- `200` - OK (GET, PUT, DELETE bem-sucedidos)
- `201` - Created (POST bem-sucedido)
- `400` - Bad Request (validação falhou)
- `401` - Unauthorized (token inválido/ausente)
- `403` - Forbidden (sem permissão ADMIN)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error

---

## Exemplos de Erro

### Validação falhou
```json
{
  "status": "error",
  "message": "CNPJ deve conter 14 dígitos"
}
```

### Recurso não encontrado
```json
{
  "status": "error",
  "message": "Empresa não encontrada"
}
```

### Restrição de negócio
```json
{
  "status": "error",
  "message": "Empresa possui 3 cargo(s) cadastrado(s)"
}
```

---

## Fluxo Completo de Uso

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' | jq -r '.data.token')

# 2. Criar empresa
COMPANY_ID=$(curl -s -X POST http://localhost:3001/api/company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"razaoSocial":"Acme","nomeFantasia":"Acme","cnpj":"12345678000190","matriz":true}' \
  | jq -r '.data.company.id')

# 3. Criar risco
RISCO_ID=$(curl -s -X POST http://localhost:3001/api/risco \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ruído","grupo":"físico"}' \
  | jq -r '.data.risco.id')

# 4. Criar exame
EXAME_ID=$(curl -s -X POST http://localhost:3001/api/global-exame \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Audiometria","tipo":"complementar"}' \
  | jq -r '.data.exame.id')

# 5. Criar ambiente
AMBIENTE_ID=$(curl -s -X POST http://localhost:3001/api/ambiente \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Produção\",\"empresaId\":\"$COMPANY_ID\"}" \
  | jq -r '.data.ambiente.id')

# 6. Criar cargo
CARGO_ID=$(curl -s -X POST http://localhost:3001/api/cargo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Operador\",\"empresaId\":\"$COMPANY_ID\"}" \
  | jq -r '.data.cargo.id')

# 7. Vincular risco ao cargo
curl -X POST "http://localhost:3001/api/cargo/$CARGO_ID/riscos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"riscoId\":\"$RISCO_ID\"}"

# 8. Vincular exame ao cargo
curl -X POST "http://localhost:3001/api/cargo/$CARGO_ID/exames" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"exameId\":\"$EXAME_ID\"}"

# 9. Criar pessoa
PERSON_ID=$(curl -s -X POST http://localhost:3001/api/person \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","cpf":"12345678901"}' \
  | jq -r '.data.person.id')

# 10. Criar vínculo
curl -X POST http://localhost:3001/api/vinculo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"personId\":\"$PERSON_ID\",\"empresaId\":\"$COMPANY_ID\",\"cargoId\":\"$CARGO_ID\",\"ativo\":true}"
```

---

## Testando com Postman/Insomnia

Importe a collection JSON:

```json
{
  "name": "API ESO",
  "requests": [
    {
      "name": "Login",
      "method": "POST",
      "url": "http://localhost:3001/api/auth/login",
      "body": {
        "username": "admin",
        "password": "admin"
      }
    },
    {
      "name": "Criar Empresa",
      "method": "POST",
      "url": "http://localhost:3001/api/company",
      "headers": {
        "Authorization": "Bearer {{token}}"
      },
      "body": {
        "razaoSocial": "Test Corp",
        "cnpj": "12345678000190",
        "matriz": true
      }
    }
  ]
}
```
