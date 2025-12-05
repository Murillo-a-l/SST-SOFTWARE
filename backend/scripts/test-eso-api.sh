#!/bin/bash

# Script de teste da API ESO
# Testa todos os endpoints implementados

API_URL="http://localhost:3001/api"
TOKEN=""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== TESTE DA API ESO ===${NC}\n"

# 1. Login
echo -e "${YELLOW}1. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}')

TOKEN=$(echo $LOGIN_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Erro: Não foi possível obter o token${NC}"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo -e "${GREEN}✓ Login bem-sucedido${NC}\n"

# 2. Criar Empresa Matriz
echo -e "${YELLOW}2. Criando empresa matriz...${NC}"
COMPANY_RESPONSE=$(curl -s -X POST "$API_URL/company" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "razaoSocial": "Acme Corporation Ltda",
    "nomeFantasia": "Acme Corp",
    "cnpj": "12345678000190",
    "cnae": "8640201",
    "grauRisco": 2,
    "email": "contato@acme.com",
    "telefone": "11999999999",
    "cidade": "São Paulo",
    "estado": "SP",
    "matriz": true
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['company']['id'])" 2>/dev/null)

if [ -z "$COMPANY_ID" ]; then
  echo -e "${RED}Erro ao criar empresa${NC}"
  echo $COMPANY_RESPONSE
  exit 1
fi

echo -e "${GREEN}✓ Empresa criada: $COMPANY_ID${NC}\n"

# 3. Criar Filial
echo -e "${YELLOW}3. Criando filial...${NC}"
FILIAL_RESPONSE=$(curl -s -X POST "$API_URL/company" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"razaoSocial\": \"Acme Filial Rio Ltda\",
    \"nomeFantasia\": \"Acme Rio\",
    \"cnpj\": \"98765432000199\",
    \"cidade\": \"Rio de Janeiro\",
    \"estado\": \"RJ\",
    \"matriz\": false,
    \"empresaMatrizId\": \"$COMPANY_ID\"
  }")

FILIAL_ID=$(echo $FILIAL_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['company']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Filial criada: $FILIAL_ID${NC}\n"

# 4. Criar Riscos
echo -e "${YELLOW}4. Criando riscos...${NC}"
RISCO1_RESPONSE=$(curl -s -X POST "$API_URL/risco" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Ruído",
    "codigo": "01.01.001",
    "grupo": "físico",
    "descricao": "Exposição a ruído contínuo ou intermitente"
  }')

RISCO1_ID=$(echo $RISCO1_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['risco']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Risco criado: $RISCO1_ID${NC}"

RISCO2_RESPONSE=$(curl -s -X POST "$API_URL/risco" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Vibração",
    "codigo": "01.01.003",
    "grupo": "físico",
    "descricao": "Exposição a vibração localizada ou de corpo inteiro"
  }')

RISCO2_ID=$(echo $RISCO2_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['risco']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Risco criado: $RISCO2_ID${NC}\n"

# 5. Criar Exames
echo -e "${YELLOW}5. Criando exames...${NC}"
EXAME1_RESPONSE=$(curl -s -X POST "$API_URL/global-exame" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Audiometria",
    "codigo": "0211010028",
    "tipo": "complementar",
    "descricao": "Exame de audiometria tonal"
  }')

EXAME1_ID=$(echo $EXAME1_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['exame']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Exame criado: $EXAME1_ID${NC}"

EXAME2_RESPONSE=$(curl -s -X POST "$API_URL/global-exame" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Exame Clínico Ocupacional",
    "codigo": "0101010010",
    "tipo": "clinico",
    "descricao": "Consulta médica ocupacional"
  }')

EXAME2_ID=$(echo $EXAME2_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['exame']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Exame criado: $EXAME2_ID${NC}\n"

# 6. Criar Ambiente
echo -e "${YELLOW}6. Criando ambiente...${NC}"
AMBIENTE_RESPONSE=$(curl -s -X POST "$API_URL/ambiente" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nome\": \"Setor de Produção\",
    \"descricao\": \"Área de produção industrial\",
    \"empresaId\": \"$COMPANY_ID\"
  }")

AMBIENTE_ID=$(echo $AMBIENTE_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['ambiente']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Ambiente criado: $AMBIENTE_ID${NC}\n"

# 7. Criar Cargo
echo -e "${YELLOW}7. Criando cargo...${NC}"
CARGO_RESPONSE=$(curl -s -X POST "$API_URL/cargo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nome\": \"Operador de Máquinas\",
    \"cbo\": \"841405\",
    \"descricao\": \"Opera máquinas industriais\",
    \"empresaId\": \"$COMPANY_ID\"
  }")

CARGO_ID=$(echo $CARGO_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['cargo']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Cargo criado: $CARGO_ID${NC}\n"

# 8. Adicionar Riscos ao Cargo
echo -e "${YELLOW}8. Adicionando riscos ao cargo...${NC}"
curl -s -X POST "$API_URL/cargo/$CARGO_ID/riscos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"riscoId\": \"$RISCO1_ID\"}" > /dev/null

curl -s -X POST "$API_URL/cargo/$CARGO_ID/riscos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"riscoId\": \"$RISCO2_ID\"}" > /dev/null

echo -e "${GREEN}✓ Riscos adicionados ao cargo${NC}\n"

# 9. Adicionar Exames ao Cargo
echo -e "${YELLOW}9. Adicionando exames ao cargo...${NC}"
curl -s -X POST "$API_URL/cargo/$CARGO_ID/exames" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"exameId\": \"$EXAME1_ID\"}" > /dev/null

curl -s -X POST "$API_URL/cargo/$CARGO_ID/exames" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"exameId\": \"$EXAME2_ID\"}" > /dev/null

echo -e "${GREEN}✓ Exames adicionados ao cargo${NC}\n"

# 10. Adicionar Ambiente ao Cargo
echo -e "${YELLOW}10. Adicionando ambiente ao cargo...${NC}"
curl -s -X POST "$API_URL/cargo/$CARGO_ID/ambientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"ambienteId\": \"$AMBIENTE_ID\"}" > /dev/null

echo -e "${GREEN}✓ Ambiente adicionado ao cargo${NC}\n"

# 11. Criar Pessoa
echo -e "${YELLOW}11. Criando pessoa...${NC}"
PERSON_RESPONSE=$(curl -s -X POST "$API_URL/person" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "dataNascimento": "1990-05-15",
    "sexo": "M",
    "telefone": "11988887777",
    "email": "joao.silva@example.com",
    "cidade": "São Paulo",
    "estado": "SP"
  }')

PERSON_ID=$(echo $PERSON_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['person']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Pessoa criada: $PERSON_ID${NC}\n"

# 12. Criar Vínculo
echo -e "${YELLOW}12. Criando vínculo...${NC}"
VINCULO_RESPONSE=$(curl -s -X POST "$API_URL/vinculo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"personId\": \"$PERSON_ID\",
    \"empresaId\": \"$COMPANY_ID\",
    \"cargoId\": \"$CARGO_ID\",
    \"ativo\": true,
    \"dataEntrada\": \"2025-01-01\"
  }")

VINCULO_ID=$(echo $VINCULO_RESPONSE | python -c "import sys, json; print(json.load(sys.stdin)['data']['vinculo']['id'])" 2>/dev/null)
echo -e "${GREEN}✓ Vínculo criado: $VINCULO_ID${NC}\n"

# 13. Listar tudo
echo -e "${YELLOW}13. Verificando dados criados...${NC}"

echo -e "\n${YELLOW}Empresas:${NC}"
curl -s -X GET "$API_URL/company" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | grep -E '(nomeFantasia|id)' | head -10

echo -e "\n${YELLOW}Pessoas:${NC}"
curl -s -X GET "$API_URL/person" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | grep -E '(nome|cpf)' | head -6

echo -e "\n${YELLOW}Vínculos:${NC}"
curl -s -X GET "$API_URL/vinculo?ativo=true" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | grep -E '(ativo|dataEntrada)' | head -6

echo -e "\n${YELLOW}Cargo completo (com riscos e exames):${NC}"
curl -s -X GET "$API_URL/cargo/$CARGO_ID" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | grep -E '(nome|cbo)' | head -10

echo -e "\n${GREEN}=== TESTE CONCLUÍDO COM SUCESSO ===${NC}\n"
echo -e "IDs criados:"
echo -e "  Empresa: $COMPANY_ID"
echo -e "  Filial: $FILIAL_ID"
echo -e "  Cargo: $CARGO_ID"
echo -e "  Ambiente: $AMBIENTE_ID"
echo -e "  Pessoa: $PERSON_ID"
echo -e "  Vínculo: $VINCULO_ID"
