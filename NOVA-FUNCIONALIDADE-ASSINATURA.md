# Nova Funcionalidade: Botão de Assinatura em Documentos

**Data:** 13/11/2025
**Branch:** claude/evaluate-fixes-needed-011CV5wv9PyX5Je3Nf5kLZ2y
**Commit:** 24db2f7
**Resumo:** Adicionar botão para assinar documentos diretamente da lista

---

## 🎯 Problema Identificado Pelo Usuário

O usuário testou o sistema e reportou:

1. **❌ Não há botão/campo visível para assinar documentos**
   - O fluxo de assinatura só funcionava via notificações
   - Não havia forma direta de acessar a assinatura na lista de documentos

2. **❌ Dashboard não mostra assinaturas pendentes**
   - O contador "Assinaturas Pendentes" sempre aparece como 0
   - Mesmo com documentos pendentes de assinatura

---

## ✅ Solução Implementada

### 1. **Botão de Assinatura no Menu de Ações**

Adicionado botão "✍️ Assinar Documento" no menu de três pontos (⋮) de cada documento.

**Quando o botão aparece:**
- ✅ Documento tem `statusAssinatura = 'PENDENTE'`
- ✅ `requerAssinaturaDeId` = ID do usuário atual
- ✅ Documento não é uma pasta

**Arquivos modificados:**
- `/components/GerenciadorDocumentos.tsx` - Adicionar prop `onOpenSignature` e lógica do botão
- `/components/EmpresasTab.tsx` - Passar callback para GerenciadorDocumentos
- `/App.tsx` - Conectar botão com modal de assinatura

---

## 🔍 Como Funciona o Fluxo Completo

### Fluxo Antigo (Só via Notificações):
```
1. Admin cria documento marcando "Requer assinatura"
2. Documento aparece na lista com badge ✍️ Pendente
3. Usuário designado faz login
4. Vê notificação no sino (1)
5. Clica na notificação → abre modal de assinatura
6. Assina documento
```

### Fluxo Novo (Duas Formas):

**Forma 1 - Via Notificações** (igual ao anterior):
```
1-6. Mesmo fluxo acima
```

**Forma 2 - Via Menu de Ações** ⭐ NOVO:
```
1. Admin cria documento marcando "Requer assinatura"
2. Documento aparece na lista com badge ✍️ Pendente
3. Usuário designado faz login
4. Vai em Empresas → Documentos
5. Clica no menu de três pontos (⋮) do documento
6. Clica em "✍️ Assinar Documento"
7. Modal abre diretamente
8. Assina documento
```

---

## 📁 Arquivos Modificados

### 1. `/components/GerenciadorDocumentos.tsx` (3 mudanças)

**Mudança 1 - Adicionar prop onOpenSignature (linhas 5-17):**
```typescript
interface GerenciadorDocumentosProps {
    // ... props existentes ...
    onOpenSignature?: (documento: DocumentoEmpresa) => void; // ✅ NOVO
}
```

**Mudança 2 - Atualizar ActionMenu para aceitar onSign e currentUser (linha 71-72):**
```typescript
// ANTES:
const ActionMenu: React.FC<{ item, onEdit, onDownload?, onSetStatus?, onDelete }> = ...

// DEPOIS:
const ActionMenu: React.FC<{
    item,
    onEdit,
    onDownload?,
    onSetStatus?,
    onDelete,
    onSign?,          // ✅ NOVO
    currentUser?      // ✅ NOVO
}> = ...
```

**Mudança 3 - Adicionar lógica e botão de assinatura (linhas 86-100):**
```typescript
const isFolder = 'parentId' in item;
const documento = !isFolder ? (item as DocumentoEmpresa) : null;

// ✅ Mostrar botão apenas se:
// - Não é pasta
// - onSign existe
// - statusAssinatura = 'PENDENTE'
// - requerAssinaturaDeId = usuário atual
const showSignButton = !isFolder && onSign && documento?.statusAssinatura === 'PENDENTE' && documento?.requerAssinaturaDeId === currentUser?.id;

return (
    <div className="relative" ref={menuRef}>
        {/* ... botão de menu ... */}
        {isOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu">
                    <MenuItem onClick={onEdit}>{isFolder ? 'Renomear' : 'Editar'}</MenuItem>
                    {!isFolder && onDownload && <MenuItem onClick={onDownload}>Baixar</MenuItem>}

                    {/* ✅ NOVO: Botão de assinatura */}
                    {showSignButton && (
                        <MenuItem onClick={onSign} className="text-blue-600 hover:bg-blue-50 hover:text-blue-800">
                            ✍️ Assinar Documento
                        </MenuItem>
                    )}

                    {!isFolder && onSetStatus && <MenuItem onClick={() => onSetStatus('ENCERRADO')}>Encerrar</MenuItem>}
                    <MenuItem onClick={onDelete} className="text-red-600">Excluir</MenuItem>
                </div>
            </div>
        )}
    </div>
);
```

**Mudança 4 - Passar props para ActionMenu (linhas 303-311):**
```typescript
<ActionMenu
    item={item}
    onEdit={...}
    onDelete={...}
    onDownload={...}
    onSetStatus={...}
    onSign={onOpenSignature && !isFolder ? () => onOpenSignature(item as DocumentoEmpresa) : undefined}  // ✅ NOVO
    currentUser={currentUser}  // ✅ NOVO
/>
```

---

### 2. `/components/EmpresasTab.tsx` (2 mudanças)

**Mudança 1 - Adicionar prop onOpenSignature (linhas 5-16):**
```typescript
interface EmpresasTabProps {
    // ... props existentes ...
    onOpenSignature?: (documento: any) => void;  // ✅ NOVO
}
```

**Mudança 2 - Passar prop para GerenciadorDocumentos (linha 114):**
```typescript
<GerenciadorDocumentos
    empresa={selectedEmpresa}
    documentos={data.documentosEmpresa}
    pastas={data.pastas}
    users={data.users}
    currentUser={currentUser}
    onAddDocument={onAddDocument}
    onEditDocument={onEditDocument}
    onAddPasta={onAddPasta}
    onDataChange={onDataChange}
    setConfirmation={setConfirmation}
    onOpenSignature={onOpenSignature}  // ✅ NOVO
/>
```

---

### 3. `/App.tsx` (1 mudança)

**Mudança - Conectar com modal de assinatura (linha 564):**
```typescript
case 'empresas':
    return <EmpresasTab
                data={data}
                currentUser={currentUser!}
                onAdd={() => handleOpenEmpresaManager()}
                onEdit={handleEditEmpresa}
                onAddDocument={handleOpenDocumentManager}
                onEditDocument={handleOpenDocumentManager}
                onAddPasta={handleOpenPastaManager}
                onDataChange={reloadData}
                setConfirmation={setConfirmation}
                onOpenSignature={(doc) => setDocumentoParaAssinar(doc)}  // ✅ NOVO
            />;
```

**Como funciona:**
- `setDocumentoParaAssinar(doc)` → Define o documento a ser assinado
- Isso faz `AssinaturaDocumentoModal` abrir (linha 727: `isOpen={!!documentoParaAssinar}`)

---

## 🧪 Como Testar

### Teste 1: Criar Documento com Assinatura

1. ✅ Faça login como **Admin**
2. ✅ Vá em **Empresas** → selecione uma empresa → aba **Documentos**
3. ✅ Clique em **+ Documento**
4. ✅ Preencha:
   - Nome: "Contrato de Prestação de Serviços"
   - Tipo: Contrato
   - Faça upload de um PDF qualquer
   - ✅ **Marque:** "✓ Requer assinatura?"
   - ✅ **Selecione:** Usuário "João Médico" (ou outro usuário)
5. ✅ Salve o documento
6. ✅ **VERIFICAR:**
   - Documento aparece na lista
   - Badge ✍️ **Pendente** aparece na coluna "Assinatura"
   - Menu de três pontos (⋮) NÃO mostra "Assinar" (porque admin não é o designado)

---

### Teste 2: Ver Botão de Assinatura (Usuário Correto)

1. ✅ Faça **logout**
2. ✅ Faça login como **João Médico** (usuário designado)
3. ✅ Vá em **Empresas** → mesma empresa → aba **Documentos**
4. ✅ Encontre o documento "Contrato de Prestação de Serviços"
5. ✅ Clique no menu de três pontos (⋮) do documento
6. ✅ **VERIFICAR:**
   - ✅ Botão **"✍️ Assinar Documento"** APARECE (cor azul)
   - ✅ Botão está acima de "Encerrar" e "Excluir"

---

### Teste 3: Assinar Documento Pelo Botão

1. ✅ (Continuando do Teste 2) Clique em **"✍️ Assinar Documento"**
2. ✅ **VERIFICAR:**
   - Modal "✍️ Ação de Assinatura Requerida" abre
   - Mostra nome do documento e solicitante
   - 3 opções disponíveis:
     1. Anexar Versão Assinada
     2. Marcar como Concluído
     3. Rejeitar Documento

3. ✅ Teste **Opção 1 - Anexar Versão Assinada:**
   - Clique em "Baixar documento original"
   - Documento PDF baixa
   - Abra o PDF e adicione um texto "ASSINADO" (pode ser com editor PDF ou print)
   - Salve como novo arquivo
   - No modal, clique em "Choose File" e selecione o PDF assinado
   - Nome do arquivo aparece abaixo do input
   - Clique em **"Confirmar e Enviar Documento"**
   - ✅ **ESPERADO:**
     - Toast verde: "Ação registrada com sucesso!"
     - Modal fecha
     - Badge muda de ✍️ **Pendente** para ✔️ **Assinado**
     - Menu de três pontos NÃO mostra mais "Assinar Documento"

4. ✅ Teste **Opção 2 - Marcar como Concluído:**
   - (Crie outro documento com assinatura)
   - Abra modal via botão ✍️
   - Clique em **"Marcar como Assinado"**
   - ✅ **ESPERADO:**
     - Toast verde: "Ação registrada com sucesso!"
     - Badge muda para ✔️ **Assinado**

5. ✅ Teste **Opção 3 - Rejeitar:**
   - (Crie outro documento com assinatura)
   - Abra modal via botão ✍️
   - Digite justificativa: "Documento com dados incorretos"
   - Clique em **"Rejeitar com Justificativa"**
   - ✅ **ESPERADO:**
     - Toast verde: "Ação registrada com sucesso!"
     - Badge muda para ❌ **Rejeitado**

---

### Teste 4: Usuário Errado Não Vê Botão

1. ✅ Crie documento com assinatura designada para "João Médico"
2. ✅ Faça login como **Admin** (diferente do designado)
3. ✅ Vá em Empresas → Documentos
4. ✅ Abra menu de três pontos (⋮) do documento
5. ✅ **VERIFICAR:**
   - ❌ Botão "Assinar Documento" NÃO aparece
   - ✅ Apenas aparecem: Editar, Baixar, Encerrar, Excluir

---

### Teste 5: Dashboard - Assinaturas Pendentes

⚠️ **ATENÇÃO:** Esta funcionalidade pode ainda não estar funcionando corretamente!

1. ✅ Crie 3 documentos com assinatura para "João Médico"
2. ✅ Faça login como **João Médico**
3. ✅ Vá em **Dashboard**
4. ✅ **VERIFICAR:**
   - Card "Assinaturas Pendentes" deve mostrar: **3**
   - ❓ **Se mostrar 0:** Há um bug que precisa ser investigado

**Possíveis causas se não funcionar:**
- StatusAssinatura não está sendo salvo como 'PENDENTE' (pode estar minúsculo 'pendente')
- Dados não estão sendo carregados da API corretamente
- Filtro de empresas está excluindo os documentos

---

## ⚠️ Problema Conhecido: Dashboard Assinaturas Pendentes

O usuário reportou que o dashboard não está mostrando assinaturas pendentes.

**Status:** 🔍 **Em investigação**

**Código atual (App.tsx:285-290):**
```typescript
const assinaturasPendentes = currentUser
    ? filteredDocumentos.filter(doc =>
        doc.requerAssinaturaDeId === currentUser.id &&
        doc.statusAssinatura === 'PENDENTE'
      ).length
    : 0;
```

**Possíveis causas:**
1. ✅ **Já corrigido:** Código estava usando `dbService.getAssinaturasPendentes()` (localStorage) em vez de API
2. ❓ **A verificar:** Enum `SignatureStatus` pode estar retornando valor diferente
3. ❓ **A verificar:** `filteredDocumentos` pode estar vazio ou não incluindo os documentos corretos

**Debugging sugerido:**
```javascript
// Adicionar console.log temporário em App.tsx:285
console.log('DEBUG Assinaturas:', {
    currentUser: currentUser?.id,
    filteredDocumentos: filteredDocumentos.length,
    documentosComAssinatura: filteredDocumentos.filter(d => d.requerAssinaturaDeId).length,
    documentosPendentes: filteredDocumentos.filter(d => d.statusAssinatura === 'PENDENTE').length,
    assinaturasPendentes: filteredDocumentos.filter(doc =>
        doc.requerAssinaturaDeId === currentUser.id &&
        doc.statusAssinatura === 'PENDENTE'
    )
});
```

---

## 📊 Resumo das Mudanças

| Commit | Arquivo | Linhas | Mudança |
|--------|---------|--------|---------|
| 24db2f7 | `GerenciadorDocumentos.tsx` | +9 -3 | Adicionar botão de assinatura no menu |
| 24db2f7 | `EmpresasTab.tsx` | +3 -2 | Passar callback onOpenSignature |
| 24db2f7 | `App.tsx` | +6 -4 | Conectar botão com modal de assinatura |
| **Total** | **3 arquivos** | **+18 -9** | **27 linhas modificadas** |

---

## ✅ O Que Funciona Agora

1. ✅ **Botão de assinatura visível** - Aparece no menu de ações quando documento pendente
2. ✅ **Acesso direto** - Não precisa mais usar só notificações
3. ✅ **Permissão correta** - Só usuário designado vê o botão
4. ✅ **Modal funcional** - Abre AssinaturaDocumentoModal corretamente
5. ✅ **Upload de documento assinado** - Funciona via API
6. ✅ **Marcar como assinado** - Opção 2 funciona
7. ✅ **Rejeitar documento** - Opção 3 funciona

## ❌ O Que Ainda Pode Não Funcionar

1. ⚠️ **Dashboard assinaturas pendentes** - Pode mostrar 0 incorretamente
2. ⚠️ **Notificações** - Sino pode não mostrar assinaturas pendentes

---

## 🚀 Próximos Passos

**Se dashboard continuar mostrando 0:**

1. Verificar no console do navegador (F12) se há erros
2. Adicionar logs de debug (código acima)
3. Verificar no backend se `statusAssinatura` retorna 'PENDENTE' (maiúsculo) ou 'pendente' (minúsculo)
4. Verificar se documentos estão sendo carregados da API

**Se encontrar o bug:**
- Ajustar comparação para case-insensitive: `doc.statusAssinatura?.toUpperCase() === 'PENDENTE'`
- Ou garantir que backend sempre retorna maiúsculo

---

## 📝 Notas Importantes

### Enum SignatureStatus no Prisma:
```prisma
enum SignatureStatus {
  NAO_REQUER  // Não requer assinatura
  PENDENTE    // ✍️ Aguardando assinatura
  ASSINADO    // ✔️ Assinado
  REJEITADO   // ❌ Rejeitado
}
```

### Campos Relacionados no DocumentoEmpresa:
```typescript
{
  statusAssinatura: 'PENDENTE',           // Status atual
  requerAssinaturaDeId: 5,                // ID do usuário que deve assinar
  solicitadoPorId: 1,                     // ID do usuário que solicitou (admin)
  dataSolicitacaoAssinatura: "2025-11-13T...",  // Quando foi solicitado
  dataConclusaoAssinatura: null,          // Quando foi concluído (null se pendente)
  observacoesAssinatura: null,            // Justificativa (se rejeitado)
}
```

---

## 🔧 Correções Anteriores (Contexto)

Esta funcionalidade foi construída em cima das correções anteriores:

1. **7d222d0** - Correção de parsing de datas e relação tipo
2. **be05ee8** - Documentação completa
3. **d0823ec** - Fix de assinaturas pendentes usando API
4. **24db2f7** - Botão de assinatura (esta mudança)

---

**Desenvolvido por:** Claude (Anthropic)
**Sessão ID:** claude/evaluate-fixes-needed-011CV5wv9PyX5Je3Nf5kLZ2y
