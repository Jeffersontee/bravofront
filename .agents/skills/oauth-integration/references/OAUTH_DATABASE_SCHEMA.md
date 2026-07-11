# 🗄️ Estrutura do Banco de Dados - OAuth Tokens

## 📋 Visão Geral da Arquitetura

Baseado na análise do projeto, você tem uma arquitetura **Node.js + MongoDB** com autenticação JWT existente. Vamos integrar OAuth mantendo compatibilidade.

## 🏗️ Estrutura de Coleções MongoDB

### 1. **Coleção: `oauth_providers`** (Nova)
```javascript
{
  _id: ObjectId,
  name: String, // 'google', 'facebook', 'apple', 'github'
  client_id: String, // Client ID do provedor OAuth
  client_secret: String, // Client Secret do provedor OAuth
  redirect_uri: String, // URI de redirecionamento
  scopes: [String], // ['email', 'profile', 'openid']
  is_active: Boolean, // true/false
  created_at: Date,
  updated_at: Date
}
```

### 2. **Coleção: `oauth_tokens`** (Nova)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // Referência para users._id
  provider: String, // 'google', 'facebook', etc.
  provider_user_id: String, // ID único do usuário no provedor
  access_token: String, // Token de acesso
  refresh_token: String, // Token de refresh (opcional)
  token_type: String, // 'Bearer'
  expires_at: Date, // Data de expiração do access_token
  scope: String, // Escopos concedidos
  id_token: String, // JWT com informações do usuário (OIDC)
  created_at: Date,
  updated_at: Date,
  last_used_at: Date, // Última vez que foi usado
  is_active: Boolean // true/false
}
```

### 3. **Coleção: `users`** (Atualização)
Adicionar campos OAuth à coleção existente:

```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  phone: String,
  type: String,
  status: String,
  email_verified: Boolean,
  photo: String,
  subscription_status: String,
  plan: String,
  establishment_id: ObjectId,

  // 🔥 NOVOS CAMPOS PARA OAUTH
  oauth_providers: [{
    provider: String, // 'google', 'facebook'
    provider_user_id: String,
    linked_at: Date,
    is_primary: Boolean // Se é o método de login principal
  }],

  // Campos de compatibilidade
  google_id: String, // Para migração (deprecated)
  facebook_id: String, // Para migração (deprecated)

  created_at: Date,
  updated_at: Date
}
```

## 🔗 Índices Recomendados

### Para `oauth_tokens`:
```javascript
// Índice composto para buscas rápidas
db.oauth_tokens.createIndex({
  user_id: 1,
  provider: 1,
  is_active: 1
});

// Índice para limpeza de tokens expirados
db.oauth_tokens.createIndex({
  expires_at: 1,
  is_active: 1
});

// Índice único para evitar duplicatas
db.oauth_tokens.createIndex({
  provider: 1,
  provider_user_id: 1,
  is_active: 1
}, { unique: true });
```

### Para `users`:
```javascript
// Índice para buscas OAuth
db.users.createIndex({
  "oauth_providers.provider": 1,
  "oauth_providers.provider_user_id": 1
});
```

## 🚀 Scripts de Migração

### 1. Criar Coleções
```javascript
// Criar coleção oauth_providers
db.createCollection("oauth_providers");

// Criar coleção oauth_tokens
db.createCollection("oauth_tokens");

// Adicionar campos OAuth à coleção users existente
db.users.updateMany(
  {},
  {
    $set: {
      oauth_providers: [],
      updated_at: new Date()
    }
  }
);
```

### 2. Popular Provedores OAuth Iniciais
```javascript
// Inserir provedores OAuth configurados
db.oauth_providers.insertMany([
  {
    name: 'google',
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
    redirect_uri: 'https://yourapp.com/auth/google/callback',
    scopes: ['email', 'profile', 'openid'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'facebook',
    client_id: 'YOUR_FACEBOOK_APP_ID',
    client_secret: 'YOUR_FACEBOOK_APP_SECRET',
    redirect_uri: 'https://yourapp.com/auth/facebook/callback',
    scopes: ['email', 'public_profile'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);
```

## 🔐 Estratégia de Segurança

### 1. **Encriptação de Tokens Sensíveis**
```javascript
// Usar crypto para encriptar tokens antes de salvar
const crypto = require('crypto');

const encryptToken = (token) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.OAUTH_ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex')
  };
};
```

### 2. **Rotação Automática de Tokens**
```javascript
// Job para limpar tokens expirados
const cleanupExpiredTokens = async () => {
  const expiredTokens = await db.oauth_tokens.updateMany(
    {
      expires_at: { $lt: new Date() },
      is_active: true
    },
    {
      $set: {
        is_active: false,
        updated_at: new Date()
      }
    }
  );

  console.log(`🧹 ${expiredTokens.modifiedCount} tokens OAuth expirados desativados`);
};
```

## 📊 Estratégia de Vinculação de Contas

### 1. **Vinculação OAuth a Conta Existente**
```javascript
const linkOAuthAccount = async (userId, provider, providerUserId, tokens) => {
  // Verificar se já existe vinculação
  const existingLink = await db.users.findOne({
    _id: userId,
    'oauth_providers.provider': provider
  });

  if (existingLink) {
    throw new Error('Conta já vinculada a este provedor OAuth');
  }

  // Adicionar vinculação
  await db.users.updateOne(
    { _id: userId },
    {
      $push: {
        oauth_providers: {
          provider,
          provider_user_id: providerUserId,
          linked_at: new Date(),
          is_primary: false
        }
      },
      $set: { updated_at: new Date() }
    }
  );

  // Salvar tokens
  await db.oauth_tokens.insertOne({
    user_id: userId,
    provider,
    provider_user_id: providerUserId,
    access_token: encryptToken(tokens.access_token).encrypted,
    refresh_token: tokens.refresh_token ? encryptToken(tokens.refresh_token).encrypted : null,
    token_type: tokens.token_type,
    expires_at: new Date(Date.now() + (tokens.expires_in * 1000)),
    scope: tokens.scope,
    id_token: tokens.id_token,
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  });
};
```

### 2. **Login OAuth**
```javascript
const oauthLogin = async (provider, providerUserId, tokens) => {
  // Buscar usuário pela vinculação OAuth
  const user = await db.users.findOne({
    'oauth_providers.provider': provider,
    'oauth_providers.provider_user_id': providerUserId
  });

  if (user) {
    // Atualizar tokens existentes
    await updateOAuthTokens(user._id, provider, tokens);
    return generateJWT(user);
  }

  // Se não encontrou, pode criar conta ou pedir vinculação
  return { requires_account_linking: true, provider_data: { provider, provider_user_id: providerUserId } };
};
```

## 🔄 Fluxo de Integração

### 1. **Endpoints da API**
```
POST /auth/oauth/:provider/initiate    # Iniciar fluxo OAuth
GET  /auth/oauth/:provider/callback    # Callback do provedor
POST /auth/oauth/link                  # Vincular conta existente
POST /auth/oauth/unlink                # Desvincular provedor
GET  /auth/oauth/providers             # Listar provedores disponíveis
```

### 2. **Middleware de Autenticação**
```javascript
const authenticateOAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.substring(7);

  try {
    // Verificar se é JWT tradicional
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (jwtError) {
    // Se não é JWT, verificar se é token OAuth
    const oauthToken = await db.oauth_tokens.findOne({
      access_token: token,
      is_active: true,
      expires_at: { $gt: new Date() }
    });

    if (!oauthToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar usuário
    const user = await db.users.findOne({ _id: oauthToken.user_id });
    req.user = user;
    req.oauth_token = oauthToken;

    // Atualizar last_used_at
    await db.oauth_tokens.updateOne(
      { _id: oauthToken._id },
      { $set: { last_used_at: new Date() } }
    );

    next();
  }
};
```

## 📈 Monitoramento e Analytics

### 1. **Logs de Uso OAuth**
```javascript
const logOAuthUsage = async (userId, provider, action) => {
  await db.oauth_logs.insertOne({
    user_id: userId,
    provider,
    action, // 'login', 'link', 'unlink', 'token_refresh'
    ip_address: getClientIP(),
    user_agent: getUserAgent(),
    timestamp: new Date()
  });
};
```

### 2. **Métricas de Performance**
- Taxa de sucesso de login OAuth
- Tempo médio de autenticação
- Provedores mais utilizados
- Taxa de conversão (login → conta criada)

## 🧪 Testes Recomendados

### 1. **Cenários de Teste**
- ✅ Login OAuth com conta nova
- ✅ Vinculação OAuth a conta existente
- ✅ Refresh automático de tokens
- ✅ Logout e limpeza de tokens
- ✅ Tentativa de acesso com token expirado
- ✅ Rate limiting para tentativas de login

### 2. **Testes de Segurança**
- ✅ Validação de tokens
- ✅ Proteção contra replay attacks
- ✅ Sanitização de dados do provedor
- ✅ Limitação de rate para endpoints OAuth

---

## 🎯 Próximos Passos

1. **Implementar as coleções** no MongoDB
2. **Configurar provedores OAuth** (Google, Facebook, etc.)
3. **Implementar endpoints** de autenticação OAuth
4. **Atualizar middleware** de autenticação
5. **Adicionar testes** e validações de segurança
6. **Implementar monitoramento** de uso

Esta estrutura permite uma integração OAuth robusta e escalável, mantendo compatibilidade com seu sistema atual de autenticação.