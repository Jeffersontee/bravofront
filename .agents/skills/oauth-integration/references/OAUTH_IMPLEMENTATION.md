# 🔧 Implementação Prática - OAuth Tokens em Node.js

## 📁 Estrutura de Arquivos Backend

```
backend/
├── models/
│   ├── oauth-provider.model.js
│   ├── oauth-token.model.js
│   └── user.model.js (atualizar)
├── services/
│   ├── oauth.service.js
│   └── token.service.js
├── routes/
│   ├── auth-oauth.routes.js
│   └── middleware/
│       └── oauth.middleware.js
├── config/
│   └── oauth.config.js
└── utils/
    └── oauth.utils.js
```

## 🗄️ Modelos Mongoose

### 1. **models/oauth-provider.model.js**
```javascript
const mongoose = require('mongoose');

const oauthProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['google', 'facebook', 'apple', 'github', 'microsoft']
  },
  client_id: {
    type: String,
    required: true
  },
  client_secret: {
    type: String,
    required: true
  },
  redirect_uri: {
    type: String,
    required: true
  },
  scopes: [{
    type: String,
    enum: ['email', 'profile', 'openid', 'public_profile']
  }],
  is_active: {
    type: Boolean,
    default: true
  },
  authorization_url: String,
  token_url: String,
  user_info_url: String
}, {
  timestamps: true
});

// Índices
oauthProviderSchema.index({ name: 1 });
oauthProviderSchema.index({ is_active: 1 });

module.exports = mongoose.model('OAuthProvider', oauthProviderSchema);
```

### 2. **models/oauth-token.model.js**
```javascript
const mongoose = require('mongoose');

const oauthTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'facebook', 'apple', 'github', 'microsoft']
  },
  provider_user_id: {
    type: String,
    required: true
  },
  access_token: {
    type: String,
    required: true,
    // Em produção, criptografe este campo
    set: function(token) {
      return encryptToken(token);
    },
    get: function(encrypted) {
      return decryptToken(encrypted);
    }
  },
  refresh_token: {
    type: String,
    set: function(token) {
      return token ? encryptToken(token) : null;
    },
    get: function(encrypted) {
      return encrypted ? decryptToken(encrypted) : null;
    }
  },
  token_type: {
    type: String,
    default: 'Bearer'
  },
  expires_at: {
    type: Date,
    required: true
  },
  scope: String,
  id_token: {
    type: String,
    set: function(token) {
      return token ? encryptToken(token) : null;
    },
    get: function(encrypted) {
      return encrypted ? decryptToken(encrypted) : null;
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_used_at: Date
}, {
  timestamps: true
});

// Índices para performance
oauthTokenSchema.index({ user_id: 1, provider: 1, is_active: 1 });
oauthTokenSchema.index({ expires_at: 1, is_active: 1 });
oauthTokenSchema.index({ provider: 1, provider_user_id: 1, is_active: 1 }, { unique: true });

// Método para verificar se token está expirado
oauthTokenSchema.methods.isExpired = function() {
  return new Date() > this.expires_at;
};

// Método para renovar token
oauthTokenSchema.methods.refresh = async function() {
  if (!this.refresh_token) {
    throw new Error('Refresh token não disponível');
  }

  const provider = await mongoose.model('OAuthProvider').findOne({ name: this.provider });
  if (!provider) {
    throw new Error('Provedor OAuth não encontrado');
  }

  // Implementar lógica de refresh específica do provedor
  const newTokens = await refreshOAuthToken(provider, this.refresh_token);

  this.access_token = newTokens.access_token;
  this.refresh_token = newTokens.refresh_token || this.refresh_token;
  this.expires_at = new Date(Date.now() + (newTokens.expires_in * 1000));
  this.updated_at = new Date();

  return this.save();
};

module.exports = mongoose.model('OAuthToken', oauthTokenSchema);
```

### 3. **models/user.model.js** (Atualização)
```javascript
const mongoose = require('mongoose');

// Adicionar campos OAuth ao schema existente
const oauthProviderSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ['google', 'facebook', 'apple', 'github', 'microsoft']
  },
  provider_user_id: {
    type: String,
    required: true
  },
  linked_at: {
    type: Date,
    default: Date.now
  },
  is_primary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Campos existentes...
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  type: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  email_verified: { type: Boolean, default: false },
  photo: String,
  subscription_status: String,
  plan: String,
  establishment_id: mongoose.Schema.Types.ObjectId,

  // 🔥 NOVOS CAMPOS OAUTH
  oauth_providers: [oauthProviderSchema],

  // Campos de compatibilidade (deprecated)
  google_id: String,
  facebook_id: String,

  // Campos de segurança
  last_login_at: Date,
  login_attempts: { type: Number, default: 0 },
  lock_until: Date
}, {
  timestamps: true
});

// Índices OAuth
userSchema.index({ 'oauth_providers.provider': 1, 'oauth_providers.provider_user_id': 1 });

// Método para verificar se usuário tem provedor OAuth vinculado
userSchema.methods.hasOAuthProvider = function(provider) {
  return this.oauth_providers.some(p => p.provider === provider);
};

// Método para obter provedor OAuth primário
userSchema.methods.getPrimaryOAuthProvider = function() {
  return this.oauth_providers.find(p => p.is_primary);
};

// Método para definir provedor OAuth como primário
userSchema.methods.setPrimaryOAuthProvider = function(provider) {
  this.oauth_providers.forEach(p => {
    p.is_primary = (p.provider === provider);
  });
};

module.exports = mongoose.model('User', userSchema);
```

## 🔐 Utilitários de Segurança

### **utils/oauth.utils.js**
```javascript
const crypto = require('crypto');

// Chave de encriptação (deve vir de variável de ambiente)
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
const ALGORITHM = 'aes-256-cbc';

function encryptToken(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAutoPadding(false);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Remove padding manual
  const padding = decrypted.charCodeAt(decrypted.length - 1);
  return decrypted.slice(0, decrypted.length - padding);
}

// Função para gerar state parameter (proteção CSRF)
function generateOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

// Função para verificar state parameter
function verifyOAuthState(state, storedState) {
  return crypto.timingSafeEqual(
    Buffer.from(state, 'hex'),
    Buffer.from(storedState, 'hex')
  );
}

// Função para limpar tokens expirados
async function cleanupExpiredTokens() {
  const OAuthToken = require('../models/oauth-token.model');

  const result = await OAuthToken.updateMany(
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

  console.log(`🧹 ${result.modifiedCount} tokens OAuth expirados desativados`);
  return result;
}

module.exports = {
  encryptToken,
  decryptToken,
  generateOAuthState,
  verifyOAuthState,
  cleanupExpiredTokens
};
```

## 🌐 Serviço OAuth

### **services/oauth.service.js**
```javascript
const axios = require('axios');
const OAuthProvider = require('../models/oauth-provider.model');
const OAuthToken = require('../models/oauth-token.model');
const User = require('../models/user.model');
const { generateOAuthState, verifyOAuthState } = require('../utils/oauth.utils');

class OAuthService {
  // Iniciar fluxo OAuth
  async initiateOAuth(providerName, redirectUri) {
    const provider = await OAuthProvider.findOne({
      name: providerName,
      is_active: true
    });

    if (!provider) {
      throw new Error('Provedor OAuth não encontrado ou inativo');
    }

    const state = generateOAuthState();

    // Armazenar state em sessão/cache para verificação posterior
    // await this.storeOAuthState(state, { provider: providerName, redirectUri });

    const authUrl = this.buildAuthorizationUrl(provider, state, redirectUri);

    return {
      authorization_url: authUrl,
      state: state
    };
  }

  // Processar callback do provedor OAuth
  async handleOAuthCallback(providerName, code, state, storedState) {
    // Verificar state para prevenir CSRF
    if (!verifyOAuthState(state, storedState)) {
      throw new Error('State parameter inválido - possível ataque CSRF');
    }

    const provider = await OAuthProvider.findOne({
      name: providerName,
      is_active: true
    });

    if (!provider) {
      throw new Error('Provedor OAuth não encontrado');
    }

    // Trocar código por tokens
    const tokens = await this.exchangeCodeForTokens(provider, code);

    // Obter informações do usuário
    const userInfo = await this.getUserInfo(provider, tokens.access_token);

    return {
      tokens,
      user_info: userInfo,
      provider: providerName
    };
  }

  // Vincular OAuth a conta existente
  async linkOAuthToAccount(userId, providerName, providerUserId, tokens) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se já está vinculado
    if (user.hasOAuthProvider(providerName)) {
      throw new Error('Conta já vinculada a este provedor OAuth');
    }

    // Adicionar vinculação
    user.oauth_providers.push({
      provider: providerName,
      provider_user_id: providerUserId,
      linked_at: new Date(),
      is_primary: false
    });

    await user.save();

    // Salvar tokens
    const oauthToken = new OAuthToken({
      user_id: userId,
      provider: providerName,
      provider_user_id: providerUserId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000)),
      scope: tokens.scope,
      id_token: tokens.id_token,
      is_active: true
    });

    await oauthToken.save();

    return { user, oauth_token: oauthToken };
  }

  // Login OAuth
  async oauthLogin(providerName, providerUserId) {
    // Buscar usuário pela vinculação OAuth
    const user = await User.findOne({
      'oauth_providers.provider': providerName,
      'oauth_providers.provider_user_id': providerUserId
    });

    if (!user) {
      throw new Error('Conta OAuth não encontrada. Vincule a uma conta existente primeiro.');
    }

    // Atualizar último login
    user.last_login_at = new Date();
    await user.save();

    return user;
  }

  // Construir URL de autorização
  buildAuthorizationUrl(provider, state, redirectUri) {
    const baseUrl = provider.authorization_url ||
      this.getDefaultAuthorizationUrl(provider.name);

    const params = new URLSearchParams({
      client_id: provider.client_id,
      redirect_uri: redirectUri || provider.redirect_uri,
      scope: provider.scopes.join(' '),
      response_type: 'code',
      state: state
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Trocar código por tokens
  async exchangeCodeForTokens(provider, code) {
    const tokenUrl = provider.token_url ||
      this.getDefaultTokenUrl(provider.name);

    const params = {
      client_id: provider.client_id,
      client_secret: provider.client_secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: provider.redirect_uri
    };

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao trocar código por tokens:', error.response?.data);
      throw new Error('Falha na autenticação OAuth');
    }
  }

  // Obter informações do usuário
  async getUserInfo(provider, accessToken) {
    const userInfoUrl = provider.user_info_url ||
      this.getDefaultUserInfoUrl(provider.name);

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return this.normalizeUserInfo(provider.name, response.data);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error.response?.data);
      throw new Error('Falha ao obter informações do usuário');
    }
  }

  // Normalizar informações do usuário de diferentes provedores
  normalizeUserInfo(provider, data) {
    switch (provider) {
      case 'google':
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          first_name: data.given_name,
          last_name: data.family_name,
          picture: data.picture,
          email_verified: data.email_verified
        };

      case 'facebook':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          first_name: data.first_name,
          last_name: data.last_name,
          picture: data.picture?.data?.url
        };

      default:
        return data;
    }
  }

  // URLs padrão para provedores comuns
  getDefaultAuthorizationUrl(provider) {
    const urls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      facebook: 'https://www.facebook.com/v12.0/dialog/oauth',
      github: 'https://github.com/login/oauth/authorize',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    };
    return urls[provider];
  }

  getDefaultTokenUrl(provider) {
    const urls = {
      google: 'https://oauth2.googleapis.com/token',
      facebook: 'https://graph.facebook.com/v12.0/oauth/access_token',
      github: 'https://github.com/login/oauth/access_token',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    };
    return urls[provider];
  }

  getDefaultUserInfoUrl(provider) {
    const urls = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      facebook: 'https://graph.facebook.com/me?fields=id,email,name,first_name,last_name,picture',
      github: 'https://api.github.com/user',
      microsoft: 'https://graph.microsoft.com/v1.0/me'
    };
    return urls[provider];
  }
}

module.exports = new OAuthService();
```

## 🛣️ Rotas OAuth

### **routes/auth-oauth.routes.js**
```javascript
const express = require('express');
const router = express.Router();
const oauthService = require('../services/oauth.service');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Iniciar fluxo OAuth
router.get('/:provider/initiate', async (req, res) => {
  try {
    const { provider } = req.params;
    const { redirect_uri } = req.query;

    const result = await oauthService.initiateOAuth(provider, redirect_uri);

    // Armazenar state na sessão
    req.session.oauth_state = result.state;

    res.json({
      success: true,
      authorization_url: result.authorization_url
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Callback do provedor OAuth
router.get('/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${error}`);
    }

    // Verificar state
    const storedState = req.session.oauth_state;
    if (!storedState || state !== storedState) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=invalid_state`);
    }

    // Limpar state da sessão
    delete req.session.oauth_state;

    // Processar callback
    const result = await oauthService.handleOAuthCallback(provider, code, state, storedState);

    // Tentar login automático
    try {
      const user = await oauthService.oauthLogin(provider, result.user_info.id);

      // Gerar JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirecionar para frontend com token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);

    } catch (loginError) {
      // Se não encontrou usuário, redirecionar para vinculação
      const tempToken = jwt.sign(
        {
          oauth_data: {
            provider,
            provider_user_id: result.user_info.id,
            user_info: result.user_info,
            tokens: result.tokens
          }
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token temporário de 10 minutos
      );

      res.redirect(`${process.env.FRONTEND_URL}/auth/link?temp_token=${tempToken}`);
    }

  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_failed`);
  }
});

// Vincular OAuth a conta existente
router.post('/link', async (req, res) => {
  try {
    const { temp_token, email, password } = req.body;

    // Verificar token temporário
    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);

    if (!decoded.oauth_data) {
      return res.status(400).json({
        success: false,
        error: 'Token temporário inválido'
      });
    }

    const { provider, provider_user_id, tokens } = decoded.oauth_data;

    // Autenticar usuário existente
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Vincular OAuth
    const result = await oauthService.linkOAuthToAccount(
      user._id,
      provider,
      provider_user_id,
      tokens
    );

    // Gerar JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Desvincular provedor OAuth
router.post('/unlink', async (req, res) => {
  try {
    const { provider } = req.body;
    const userId = req.user.id; // Assumindo middleware de auth

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Remover vinculação
    user.oauth_providers = user.oauth_providers.filter(
      p => p.provider !== provider
    );

    await user.save();

    // Desativar tokens
    await require('../models/oauth-token.model').updateMany(
      { user_id: userId, provider, is_active: true },
      { $set: { is_active: false, updated_at: new Date() } }
    );

    res.json({
      success: true,
      message: 'Provedor OAuth desvinculado com sucesso'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Listar provedores OAuth disponíveis
router.get('/providers', async (req, res) => {
  try {
    const providers = await require('../models/oauth-provider.model')
      .find({ is_active: true })
      .select('name scopes');

    res.json({
      success: true,
      providers: providers.map(p => ({
        name: p.name,
        scopes: p.scopes
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
```

## ⚙️ Configuração OAuth

### **config/oauth.config.js**
```javascript
module.exports = {
  // Configurações de provedores OAuth
  providers: {
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://yourapp.com/auth/google/callback',
      scopes: ['email', 'profile', 'openid'],
      authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      token_url: 'https://oauth2.googleapis.com/token',
      user_info_url: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },

    facebook: {
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || 'https://yourapp.com/auth/facebook/callback',
      scopes: ['email', 'public_profile'],
      authorization_url: 'https://www.facebook.com/v12.0/dialog/oauth',
      token_url: 'https://graph.facebook.com/v12.0/oauth/access_token',
      user_info_url: 'https://graph.facebook.com/me?fields=id,email,name,first_name,last_name,picture'
    },

    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI || 'https://yourapp.com/auth/github/callback',
      scopes: ['user:email', 'read:user'],
      authorization_url: 'https://github.com/login/oauth/authorize',
      token_url: 'https://github.com/login/oauth/access_token',
      user_info_url: 'https://api.github.com/user'
    }
  },

  // Configurações de segurança
  security: {
    state_expiration: 10 * 60 * 1000, // 10 minutos
    token_encryption_key: process.env.OAUTH_ENCRYPTION_KEY,
    jwt_temp_token_expiration: '10m'
  },

  // Configurações de limpeza
  cleanup: {
    expired_tokens_interval: 24 * 60 * 60 * 1000, // 24 horas
    max_login_attempts: 5,
    lock_time: 2 * 60 * 60 * 1000 // 2 horas
  }
};
```

## 🚀 Como Usar

### 1. **Instalar Dependências**
```bash
npm install axios crypto mongoose jsonwebtoken express-session
```

### 2. **Configurar Variáveis de Ambiente**
```env
# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Segurança
OAUTH_ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret

# URLs
FRONTEND_URL=https://yourapp.com
```

### 3. **Integrar no App Principal**
```javascript
const express = require('express');
const session = require('express-session');
const oauthRoutes = require('./routes/auth-oauth.routes');

const app = express();

// Middleware de sessão para OAuth state
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Em produção, use HTTPS
}));

// Rotas OAuth
app.use('/auth/oauth', oauthRoutes);

// Limpeza automática de tokens expirados
const { cleanupExpiredTokens } = require('./utils/oauth.utils');
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000); // A cada 24 horas
```

Esta implementação fornece uma base sólida e segura para integração OAuth, mantendo compatibilidade com seu sistema atual de autenticação JWT.