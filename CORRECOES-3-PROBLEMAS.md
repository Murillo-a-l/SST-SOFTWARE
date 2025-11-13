# ✅ Correções dos 3 Problemas Críticos

**Data:** 13/11/2025
**Branch:** `claude/verify-chat-changes-01TDdfiCKDKje6UAXd1NgNzT`
**Resumo:** Implementação completa das 3 correções solicitadas

---

## 🔧 Problema 1: Invalid Date / NaN dias - ✅ CORRIGIDO

### Descrição do Problema
- Datas mostrando "Invalid Date" no frontend
- Alertas mostrando "Vence em NaN dias"
- Causa: Backend retorna datas ISO completas (`2025-12-01T00:00:00.000Z`) mas frontend tentava adicionar `T00:00:00` novamente

### Solução Implementada

**Arquivos modificados:**
1. `components/DashboardAlerts.tsx` (linha 21-22)
2. `components/GerenciadorDocumentos.tsx` (linha 232-234)

**Código anterior:**
```typescript
const dataVenc = new Date(dataFim + 'T00:00:00');  // ❌ Problema
```

**Código corrigido:**
```typescript
// Extrair apenas YYYY-MM-DD para evitar problemas com ISO completo
const dataStr = dataFim.split('T')[0];  // "2025-12-01"
const dataVenc = new Date(dataStr + 'T00:00:00');
```

### Resultado
✅ Datas agora são parseadas corretamente
✅ Alertas mostram "Vence em X dias" corretamente
✅ Sem mais "Invalid Date" ou "NaN"

---

## 📁 Problema 2: Documento Original Perdido - ✅ CORRIGIDO

### Descrição do Problema
- Quando documento assinado era enviado, substituía o arquivo original
- Perda permanente do documento não assinado
- Impossível recuperar versão original após assinatura

### Solução Implementada

#### 1. **Adicionado campo separado no Schema Prisma**

**Arquivo:** `backend/prisma/schema.prisma` (linha 164)

```prisma
model DocumentoEmpresa {
  // ... campos existentes ...
  arquivoUrl                  String           @map("arquivo_url")
  arquivoAssinadoUrl          String?          @map("arquivo_assinado_url")  // ✅ Novo campo
  // ... demais campos ...
}
```

#### 2. **Atualizado interface TypeScript**

**Arquivo:** `types.ts` (linha 67)

```typescript
export interface DocumentoEmpresa {
  // ... campos existentes ...
  arquivoBase64: string;
  arquivoAssinadoBase64?: string;  // ✅ Novo campo
  // ... demais campos ...
}
```

#### 3. **Backend aceita arquivo assinado separado**

**Arquivo:** `backend/src/routes/documento.routes.ts`

- Linha 212: Adicionado `arquivoAssinadoBase64` no destructuring do PUT
- Linha 267: Adicionado `arquivoAssinadoUrl` no update do Prisma

```typescript
const {
  // ... outros campos ...
  arquivoAssinadoBase64,  // ✅ Novo campo aceito
} = req.body;

const documento = await prisma.documentoEmpresa.update({
  data: {
    // ... outros campos ...
    arquivoAssinadoUrl: arquivoAssinado !== undefined ? arquivoAssinado : undefined,  // ✅ Salva separado
  },
});
```

#### 4. **Modal de assinatura salva em campo separado**

**Arquivo:** `components/modals/AssinaturaDocumentoModal.tsx` (linha 71)

```typescript
// ANTES:
updatedData = {
  arquivoBase64: novaVersaoBase64,  // ❌ Substituía o original
  statusAssinatura: 'ASSINADO',
};

// DEPOIS:
updatedData = {
  arquivoAssinadoBase64: novaVersaoBase64,  // ✅ Salva em campo separado
  statusAssinatura: 'ASSINADO',
};
```

#### 5. **Menu com botões separados**

**Arquivo:** `components/GerenciadorDocumentos.tsx`

- Linha 97: Detecta se há versão assinada (`hasSignedVersion`)
- Linhas 108-110: Mostra 2 botões quando há documento assinado:
  - **📄 Baixar Original** - arquivo sem assinatura
  - **✅ Baixar Assinado** - arquivo assinado

```typescript
const hasSignedVersion = !isFolder && documento?.arquivoAssinadoBase64;

// No menu:
{!hasSignedVersion && <MenuItem>📄 Baixar</MenuItem>}
{hasSignedVersion && <MenuItem>📄 Baixar Original</MenuItem>}
{hasSignedVersion && <MenuItem>✅ Baixar Assinado</MenuItem>}
```

#### 6. **Função de download atualizada**

**Arquivo:** `components/GerenciadorDocumentos.tsx` (linha 203)

```typescript
const handleDownload = (doc: DocumentoEmpresa, useSignedVersion: boolean = false) => {
  const fileData = useSignedVersion && doc.arquivoAssinadoBase64
    ? doc.arquivoAssinadoBase64  // Versão assinada
    : doc.arquivoBase64;          // Versão original

  const fileName = useSignedVersion ? `[ASSINADO] ${doc.nome}` : doc.nome;
  // ... resto do código de download
};
```

### Resultado
✅ Documento original é mantido em `arquivoUrl`
✅ Documento assinado é salvo em `arquivoAssinadoUrl`
✅ Sistema mantém AMBOS os arquivos
✅ Menu mostra botões separados quando há versão assinada
✅ Download identifica versão com prefixo `[ASSINADO]`

---

## ⬅️ Problema 3: Botão "Voltar" nas Pastas - ✅ CORRIGIDO

### Descrição do Problema
- Usuários precisam clicar no breadcrumb pequeno no topo
- Difícil navegação em estruturas de pastas profundas
- Falta de affordance visual para voltar

### Solução Implementada

**Arquivo:** `components/GerenciadorDocumentos.tsx` (linhas 276-298)

```typescript
{/* Botão Voltar e Breadcrumb */}
<div className="mb-4 flex items-center gap-3">
  {/* ⬅️ Botão Voltar - aparece apenas quando não está na raiz */}
  {currentFolderId !== null && (
    <button
      onClick={() => {
        const currentCrumb = breadcrumbs.find(c => c.id === currentFolderId);
        setCurrentFolderId(currentCrumb?.parentId || null);
      }}
      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition"
    >
      ⬅️ Voltar
    </button>
  )}

  {/* Breadcrumb existente */}
  <div className="text-sm text-gray-600">
    <button onClick={() => setCurrentFolderId(null)}>Raiz</button>
    {breadcrumbs.map(crumb => (
      <span key={crumb.id}>
        <span className="mx-1">/</span>
        <button onClick={() => setCurrentFolderId(crumb.id)}>{crumb.nome}</button>
      </span>
    ))}
  </div>
</div>
```

### Características
- ✅ Botão visível e destacado com fundo cinza
- ✅ Aparece **apenas** quando não está na raiz (`currentFolderId !== null`)
- ✅ Volta para a pasta pai ao clicar
- ✅ Efeito hover para feedback visual
- ✅ Ícone ⬅️ para clareza

### Resultado
✅ Navegação mais intuitiva
✅ Botão grande e clicável
✅ Visualmente separado do breadcrumb
✅ Usuários encontram facilmente como voltar

---

## 📋 Resumo das Modificações

| Arquivo | Mudanças | Tipo |
|---------|----------|------|
| `components/DashboardAlerts.tsx` | Linha 21-22: Extrair YYYY-MM-DD antes de parsear | Correção 1 |
| `components/GerenciadorDocumentos.tsx` | Linha 232-234: Extrair YYYY-MM-DD<br>Linhas 70-119: Menu com botões separados<br>Linha 203-246: Download com versão assinada<br>Linhas 276-298: Botão Voltar | Correções 1, 2, 3 |
| `components/modals/AssinaturaDocumentoModal.tsx` | Linha 71: Salvar em arquivoAssinadoBase64 | Correção 2 |
| `backend/prisma/schema.prisma` | Linha 164: Campo arquivoAssinadoUrl | Correção 2 |
| `backend/src/routes/documento.routes.ts` | Linhas 212, 267: Aceitar e salvar arquivoAssinadoBase64 | Correção 2 |
| `types.ts` | Linha 67: Campo arquivoAssinadoBase64 | Correção 2 |
| `services/apiService.ts` | Linhas 471, 485: Mapear arquivoAssinadoUrl | Correção 2 |

**Total:** 7 arquivos, ~100 linhas modificadas/adicionadas

---

## 🗄️ Migration do Banco de Dados

### ⚠️ IMPORTANTE: Aplicar Migration SQL

Para que o campo `arquivo_assinado_url` seja criado no banco, execute:

```bash
cd backend

# Opção 1: Usar o script SQL fornecido
psql -U seu_usuario -d occupational_health -f add_arquivo_assinado.sql

# Opção 2: Executar manualmente no psql
psql -U seu_usuario -d occupational_health
```

```sql
ALTER TABLE documentos_empresa
ADD COLUMN IF NOT EXISTS arquivo_assinado_url TEXT;

COMMENT ON COLUMN documentos_empresa.arquivo_assinado_url IS 'Stores the signed version of the document (base64), keeping the original in arquivo_url';
```

### Verificar se a migration foi aplicada

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos_empresa'
  AND column_name = 'arquivo_assinado_url';
```

**Resultado esperado:**
```
     column_name      | data_type | is_nullable
----------------------+-----------+-------------
 arquivo_assinado_url | text      | YES
```

---

## 🧪 Como Testar

### Teste 1: Validação de Datas (Correção 1)

1. Acesse o **Dashboard**
2. Vá em **Alertas de Documentos**
3. ✅ **Esperado:** Datas mostram formato correto:
   - "Vence em 15 dias"
   - "Vencido há 5 dias"
   - "Vence hoje"
4. ❌ **Não deve mostrar:** "Invalid Date", "NaN dias"

### Teste 2: Documento Original Não é Perdido (Correção 2)

**Passo 1 - Upload de documento original:**
1. Vá em **Empresas** → Selecione uma empresa → **Documentos**
2. Clique em **+ Documento**
3. Faça upload de um PDF (ex: contrato.pdf)
4. Marque "✓ Requer assinatura?"
5. Designe para outro usuário
6. Salve o documento
7. ✅ **Esperado:** Documento criado com status "PENDENTE"

**Passo 2 - Assinar documento:**
1. Faça logout e login como usuário designado
2. Vá até o documento na lista
3. Clique no menu **⋮** → **✍️ Assinar Documento**
4. Baixe o documento original clicando em "Baixar documento original"
5. ✅ **Esperado:** Download do PDF original
6. Selecione um arquivo PDF assinado (pode ser o mesmo para teste)
7. Clique em **"Confirmar e Enviar Documento"**
8. ✅ **Esperado:** Toast de sucesso "Ação registrada com sucesso!"

**Passo 3 - Verificar ambos os arquivos:**
1. Volte para a lista de documentos
2. Clique no menu **⋮** do documento assinado
3. ✅ **Esperado:** Menu mostra 2 botões:
   - **📄 Baixar Original** ← arquivo sem assinatura
   - **✅ Baixar Assinado** ← arquivo assinado
4. Teste ambos os downloads
5. ✅ **Esperado:**
   - Primeiro download: nome original
   - Segundo download: `[ASSINADO] nome original`

**Passo 4 - Verificar no banco:**
```sql
SELECT
  nome,
  LENGTH(arquivo_url) as tamanho_original,
  LENGTH(arquivo_assinado_url) as tamanho_assinado,
  status_assinatura
FROM documentos_empresa
WHERE nome LIKE '%contrato%';
```

✅ **Esperado:**
- `arquivo_url` preenchido (documento original)
- `arquivo_assinado_url` preenchido (documento assinado)
- Ambos com tamanhos diferentes (ou iguais se usou mesmo arquivo)

### Teste 3: Botão Voltar nas Pastas (Correção 3)

**Passo 1 - Estrutura de pastas:**
1. Vá em **Empresas** → Selecione uma empresa → **Documentos**
2. Clique em **+ Nova Pasta**
3. Crie pasta "Contratos"
4. Clique duas vezes na pasta "Contratos" para entrar
5. ✅ **Esperado:** Botão **⬅️ Voltar** aparece no topo

**Passo 2 - Criar subpasta:**
1. Dentro de "Contratos", clique em **+ Nova Pasta**
2. Crie pasta "2025"
3. Entre na pasta "2025" (duplo clique)
4. ✅ **Esperado:** Botão **⬅️ Voltar** ainda visível

**Passo 3 - Testar navegação:**
1. Clique em **⬅️ Voltar**
2. ✅ **Esperado:** Voltou para "Contratos"
3. Clique em **⬅️ Voltar** novamente
4. ✅ **Esperado:** Voltou para "Raiz"
5. ✅ **Esperado:** Botão **⬅️ Voltar** desaparece (está na raiz)

**Passo 4 - Breadcrumb ainda funciona:**
1. Entre novamente em Contratos → 2025
2. Clique no link "Raiz" do breadcrumb
3. ✅ **Esperado:** Voltou para raiz
4. ✅ **Esperado:** Botão **⬅️ Voltar** desapareceu

---

## ✅ Status Final

| Correção | Implementado | Testado | Documentado |
|----------|--------------|---------|-------------|
| **1. Invalid Date / NaN dias** | ✅ | ⚠️ Pendente | ✅ |
| **2. Documento Original Perdido** | ✅ | ⚠️ Pendente | ✅ |
| **3. Botão Voltar nas Pastas** | ✅ | ⚠️ Pendente | ✅ |

**Migration SQL:** ✅ Criada (pendente aplicação no banco)

---

## 🚀 Próximos Passos

1. **Aplicar migration SQL** no banco de dados
2. **Testar todas as correções** conforme guia acima
3. **Commit e push** das alterações
4. **Criar PR** se necessário

---

## 📝 Notas Técnicas

### Problema com Datas ISO

O backend retorna datas do PostgreSQL no formato ISO completo:
```
"2025-12-01T00:00:00.000Z"
```

Se o frontend tentar adicionar `T00:00:00` novamente:
```typescript
new Date("2025-12-01T00:00:00.000Z" + "T00:00:00")  // ❌ ERRO!
// Resultado: "2025-12-01T00:00:00.000ZT00:00:00" = Invalid Date
```

**Solução:** Extrair apenas `YYYY-MM-DD`:
```typescript
const dataStr = dataFim.split('T')[0];  // "2025-12-01"
new Date(dataStr + 'T00:00:00')         // ✅ OK!
```

### Arquitetura de Arquivos Assinados

```
DocumentoEmpresa {
  arquivoUrl: "data:application/pdf;base64,JVBERi0xLjQKJ..."     ← ORIGINAL
  arquivoAssinadoUrl: "data:application/pdf;base64,JVBERi0..." ← ASSINADO
}
```

**Vantagens:**
- ✅ Mantém histórico de ambas as versões
- ✅ Permite download separado
- ✅ Rastreabilidade completa
- ✅ Não perde documento original

**Desvantagens:**
- ⚠️ Aumenta uso de espaço no banco (2x o tamanho)
- ⚠️ Possível migração futura para armazenamento em S3/MinIO

---

**Desenvolvido por:** Claude (Anthropic)
**Data:** 13/11/2025
**Branch:** claude/verify-chat-changes-01TDdfiCKDKje6UAXd1NgNzT
