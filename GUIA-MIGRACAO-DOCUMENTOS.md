# Guia de Migração - Sistema de Documentos com Assinatura

## ⚠️ IMPORTANTE: Leia antes de executar

Este guia documenta as mudanças implementadas no sistema de gerenciamento de documentos para separar corretamente o **ARQUIVO ORIGINAL** do **ARQUIVO ASSINADO**.

## 🎯 O que foi mudado?

### 1. **Banco de Dados (Prisma Schema)**

O schema do Prisma já foi atualizado com os seguintes campos na tabela `documentos_empresa`:

- `arquivoUrl` → Renomeado conceitualmente para **arquivo original** (obrigatório)
- `arquivoAssinadoUrl` → **Novo campo** para armazenar o arquivo assinado (opcional)
- `statusAssinatura` → Valores: `NAO_REQUER`, `PENDENTE`, `ASSINADO`, `REJEITADO`
- `solicitadoPorId` → ID do usuário que solicitou a assinatura
- `requerAssinaturaDeId` → ID do usuário que deve assinar
- `dataSolicitacaoAssinatura` → Data da solicitação
- `dataConclusaoAssinatura` → Data da conclusão (assinatura ou rejeição)
- `observacoesAssinatura` → Observações/motivo da rejeição

### 2. **Backend (Novas Rotas)**

Foram adicionados 3 novos endpoints na rota `/api/documentos`:

#### ✅ `PATCH /api/documentos/:id/assinado`
**Objetivo**: Enviar o documento assinado (NÃO duplica, atualiza o mesmo documento)

**Body**:
```json
{
  "arquivoAssinadoBase64": "data:application/pdf;base64,...",
  "observacoesAssinatura": "Assinado conforme solicitado"
}
```

**Resposta**: Documento atualizado com `arquivoAssinadoUrl` preenchido e `statusAssinatura = ASSINADO`

---

#### ❌ `PATCH /api/documentos/:id/invalidate`
**Objetivo**: Invalidar/rejeitar uma assinatura (mantém histórico)

**Body**:
```json
{
  "observacoesAssinatura": "Documento com informações incorretas"
}
```

**Resposta**: Documento atualizado com `statusAssinatura = REJEITADO`

---

#### 🔄 `PATCH /api/documentos/:id/reset-assinado`
**Objetivo**: Remover o arquivo assinado e voltar status para PENDENTE

**Body**: Nenhum

**Resposta**: Documento atualizado com `arquivoAssinadoUrl = null` e `statusAssinatura = PENDENTE`

---

### 3. **Frontend (Novo Fluxo)**

O modal `AssinaturaDocumentoModal.tsx` foi completamente reestruturado com **4 BLOCOS**:

#### 📄 **BLOCO 1 — Informações do Documento**
- Nome, tipo, status de assinatura, solicitante

#### 📑 **BLOCO 2 — Documento Original**
- Botão para baixar documento original
- Aviso: "O documento original não pode ser substituído"

#### ✒️ **BLOCO 3 — Documento Assinado**

**Se NÃO houver arquivo assinado:**
- Upload de arquivo PDF
- Botão "Enviar Documento Assinado"
- Botão "Assinar Digitalmente" (desabilitado - funcionalidade futura)

**Se JÁ houver arquivo assinado:**
- Botão "Baixar Documento Assinado"
- Botão "Apagar Documento Assinado"

#### 🔄 **BLOCO 4 — Ações de Fluxo**
- **Opção 2**: Confirmar Assinatura (sem enviar arquivo)
- **Opção 3**: Rejeitar Assinatura (com motivo obrigatório)

---

## 📋 Passo a passo para aplicar as mudanças

### Passo 1: Parar os processos Node.js

Há vários processos Node.js ativos que estão bloqueando o banco de dados. Execute:

```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

### Passo 2: Aplicar as migrações pendentes

Navegue até a pasta `backend` e execute:

```bash
cd backend
npx prisma migrate deploy
```

Isso aplicará as 3 migrações pendentes:
- `20250114_make_pcmso_fields_optional`
- `20250115_make_medico_optional`
- `20251113144304_add_tipo_arquivo_to_documentos`

### Passo 3: Verificar se as colunas foram criadas

Execute o script de verificação:

```bash
cd backend
node check-schema.js
```

Você deve ver as seguintes colunas na tabela `documentos_empresa`:
- `arquivo_url` (STRING)
- `arquivo_assinado_url` (STRING, nullable)
- `status_assinatura` (ENUM)
- `requer_assinatura_de_id` (INT, nullable)
- `solicitado_por_id` (INT, nullable)
- `data_solicitacao_assinatura` (TIMESTAMP, nullable)
- `data_conclusao_assinatura` (TIMESTAMP, nullable)
- `observacoes_assinatura` (TEXT, nullable)

### Passo 4: Reiniciar o backend

```bash
cd backend
npm run dev
```

### Passo 5: Reiniciar o frontend

```bash
npm run dev
```

---

## 🧪 Testando o novo fluxo

### Teste 1: Criar documento e solicitar assinatura

1. Vá para uma empresa
2. Crie um novo documento
3. Marque "Requer assinatura de" e selecione um usuário
4. Salve o documento
5. Verifique que o status é "PENDENTE"

### Teste 2: Enviar documento assinado

1. Acesse o sistema com o usuário que deve assinar
2. Clique no botão "Assinar Documento" no menu de ações
3. Faça upload de um PDF assinado
4. Clique em "Enviar Documento Assinado"
5. Verifique que:
   - O status mudou para "ASSINADO"
   - O botão "Baixar Assinado" aparece no menu
   - O original ainda está preservado

### Teste 3: Apagar documento assinado (correção)

1. No modal de assinatura, clique em "Apagar Documento Assinado"
2. Confirme a ação
3. Verifique que:
   - O arquivo assinado foi removido
   - O status voltou para "PENDENTE"
   - O arquivo original foi preservado

### Teste 4: Rejeitar documento

1. No modal de assinatura, vá para "Rejeitar Assinatura"
2. Digite um motivo (obrigatório)
3. Clique em "Rejeitar Assinatura"
4. Verifique que:
   - O status mudou para "REJEITADO"
   - O motivo foi salvo

---

## 🎨 Melhorias de UX

### Badges de Status Melhorados

Os badges de assinatura agora têm cores profissionais:

- **Não Requer**: Cinza claro (`bg-gray-100 text-gray-600`)
- **Pendente**: Amarelo suave (`bg-amber-100 text-amber-700`)
- **Assinado**: Verde clínico (`bg-green-100 text-green-700`)
- **Rejeitado**: Vermelho (`bg-red-100 text-red-700`)

### Modal de Empresa com Scroll

O formulário de nova empresa agora tem:
- Altura máxima: 90vh
- Scroll automático quando o conteúdo excede a altura
- Layout flexível que não corta campos

---

## 🔍 Pontos de Atenção

1. **Compatibilidade**: O campo `arquivoBase64` no frontend é mantido para compatibilidade, mas internamente representa `arquivoUrl` (original)

2. **Não há duplicação**: Diferente do endpoint antigo `/assinar` (POST), os novos endpoints PATCH atualizam o mesmo documento

3. **Histórico de rejeição**: Quando um documento é rejeitado, o arquivo assinado (se existir) NÃO é apagado, mantendo o histórico

4. **Validações**: O backend valida que:
   - Arquivo assinado é obrigatório no upload
   - Motivo é obrigatório na rejeição
   - Documento existe antes de qualquer operação

---

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do backend (`backend/logs` ou console)
2. Verifique se o PostgreSQL está rodando: `sc query postgresql-x64-18`
3. Verifique se há advisory locks: Reinicie os processos Node.js
4. Em último caso, execute `npx prisma migrate reset --force` (⚠️ APAGA TODOS OS DADOS!)

---

**Desenvolvido com Claude Code** 🤖
