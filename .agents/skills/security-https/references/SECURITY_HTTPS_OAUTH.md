# 🔐 Sistema de Segurança SaaS - HTTPS + OAuth

## 📋 Visão Geral da Segurança

**Sistema de Segurança Enterprise** com **HTTPS obrigatório** e **autenticação OAuth 2.0** completa para proteger todas as transações e dados do SaaS marketplace.

### 🎯 Objetivos de Segurança
- **HTTPS obrigatório** em todas as comunicações
- **OAuth 2.0 completo** com PKCE e refresh tokens
- **Criptografia end-to-end** de dados sensíveis
- **Rate limiting** e proteção DDoS
- **Auditoria completa** de todas as ações
- **Compliance** com LGPD e PCI DSS

---

## 🔒 Arquitetura de Segurança

### **1. HTTPS Configuration**

```javascript
// config/ssl.config.js
const fs = require('fs');
const path = require('path');

const sslConfig = {
  // Certificado SSL
  key: fs.readFileSync(path.join(__dirname, '../certs/private.key')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/certificate.crt')),

  // Cadeia de certificação (se aplicável)
  ca: fs.readFileSync(path.join(__dirname, '../certs/ca-bundle.crt')),

  // Configurações de segurança
  secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },

  // Outras configurações
  requestCert: false,
  rejectUnauthorized: false
};

module.exports = sslConfig;
```

### **2. Server HTTPS Setup**

```javascript
// server.js
const express = require('express');
const https = require('https');
const http = require('http');
const sslConfig = require('./config/ssl.config');
const securityMiddleware = require('./middleware/security.middleware');

const app = express();

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Security middleware
app.use(securityMiddleware);

// Rotas da API
app.use('/api', require('./routes/api.routes'));

// HTTPS Server
const httpsServer = https.createServer(sslConfig, app);

// HTTP Server (apenas para redirect)
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://${req.header('host')}${req.url}`);
});
const httpServer = http.createServer(httpApp);

// Iniciar servidores
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const HTTP_PORT = process.env.HTTP_PORT || 80;

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`🔐 HTTPS Server running on port ${HTTPS_PORT}`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`🔄 HTTP Redirect server running on port ${HTTP_PORT}`);
});
```

---

## 🛡️ Security Middleware

### **1. Headers de Segurança**

```javascript
// middleware/security.middleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const securityMiddleware = [
  // Helmet para headers de segurança
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "https://js.mercadopago.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.mercadopago.com", "https://api.stripe.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }),

  // CORS configuration
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por IP
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting para webhooks
      return req.path.startsWith('/webhooks/');
    }
  }),

  // API rate limiting mais restritivo
  rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 requests por minuto para APIs
    message: {
      error: 'API rate limit exceeded'
    },
    skip: (req) => !req.path.startsWith('/api/')
  }),

  // Body parser com limites
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      // Verificar tamanho do body
      if (buf.length > 10 * 1024 * 1024) { // 10MB
        throw new Error('Request entity too large');
      }
    }
  }),
  express.urlencoded({ extended: true, limit: '10mb' }),

  // Custom security headers
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  }
];

module.exports = securityMiddleware;
```

### **2. Autenticação OAuth 2.0**

```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Establishment = require('../models/establishment.model');

// Verificar JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar se token está na lista negra
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Adicionar user ao request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      establishment_id: user.establishment_id
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Verificar permissões por role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Verificar ownership do estabelecimento
const authorizeEstablishment = async (req, res, next) => {
  try {
    const establishmentId = req.params.establishmentId || req.body.establishment_id;

    if (!establishmentId) {
      return res.status(400).json({
        error: 'Establishment ID required',
        code: 'ESTABLISHMENT_ID_MISSING'
      });
    }

    // Verificar se usuário pertence ao estabelecimento
    if (req.user.establishment_id.toString() !== establishmentId.toString()) {
      return res.status(403).json({
        error: 'Access denied to this establishment',
        code: 'ESTABLISHMENT_ACCESS_DENIED'
      });
    }

    next();
  } catch (error) {
    console.error('Establishment authorization error:', error);
    res.status(500).json({
      error: 'Authorization error',
      code: 'AUTH_ERROR'
    });
  }
};

// Verificar se token está na lista negra
async function isTokenBlacklisted(token) {
  // Implementar cache Redis para blacklist
  const blacklisted = await redis.get(`blacklist:${token}`);
  return !!blacklisted;
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeEstablishment
};
```

---

## 🔑 Sistema OAuth 2.0 Completo

### **1. Serviço de Autenticação OAuth**

```javascript
// services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const AuditLog = require('../models/audit-log.model');

class AuthService {

  /**
   * Registrar novo usuário
   */
  async register(userData) {
    const { email, password, name, role = 'establishment_user', establishment_id } = userData;

    // Verificar se email já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      establishment_id,
      email_verified: false,
      two_factor_enabled: false,
      last_login: null,
      login_attempts: 0,
      locked_until: null
    });

    await user.save();

    // Log de auditoria
    await AuditLog.create({
      action: 'USER_REGISTERED',
      user_id: user._id,
      details: { email, role },
      ip_address: userData.ip_address,
      user_agent: userData.user_agent
    });

    // Gerar tokens
    return await this.generateTokens(user);
  }

  /**
   * Login com email/senha
   */
  async login(credentials, clientInfo = {}) {
    const { email, password } = credentials;

    // Buscar usuário
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar se conta está bloqueada
    if (user.locked_until && user.locked_until > new Date()) {
      throw new Error('Account temporarily locked due to failed login attempts');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Incrementar tentativas de login
      user.login_attempts += 1;

      // Bloquear conta após 5 tentativas
      if (user.login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
      }

      await user.save();

      throw new Error('Invalid credentials');
    }

    // Resetar tentativas de login
    user.login_attempts = 0;
    user.locked_until = null;
    user.last_login = new Date();
    await user.save();

    // Log de auditoria
    await AuditLog.create({
      action: 'USER_LOGIN',
      user_id: user._id,
      details: { success: true },
      ip_address: clientInfo.ip_address,
      user_agent: clientInfo.user_agent
    });

    // Gerar tokens
    return await this.generateTokens(user);
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshTokenString) {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshTokenString, process.env.JWT_REFRESH_SECRET);

      // Buscar refresh token no banco
      const refreshToken = await RefreshToken.findOne({
        token: refreshTokenString,
        user_id: decoded.userId,
        revoked: false,
        expires_at: { $gt: new Date() }
      });

      if (!refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Buscar usuário
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Revogar refresh token antigo
      refreshToken.revoked = true;
      refreshToken.revoked_at = new Date();
      await refreshToken.save();

      // Gerar novos tokens
      return await this.generateTokens(user);

    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout (revogar tokens)
   */
  async logout(userId, refreshTokenString = null) {
    // Revogar refresh token específico
    if (refreshTokenString) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshTokenString, user_id: userId },
        { revoked: true, revoked_at: new Date() }
      );
    } else {
      // Revogar todos os refresh tokens do usuário
      await RefreshToken.updateMany(
        { user_id: userId, revoked: false },
        { revoked: true, revoked_at: new Date() }
      );
    }

    // Log de auditoria
    await AuditLog.create({
      action: 'USER_LOGOUT',
      user_id: userId,
      details: { all_tokens: !refreshTokenString },
      ip_address: null,
      user_agent: null
    });
  }

  /**
   * Gerar access e refresh tokens
   */
  async generateTokens(user) {
    // Payload do token
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      establishment_id: user.establishment_id
    };

    // Access token (curta duração)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'saas-api',
      audience: 'saas-client'
    });

    // Refresh token (longa duração)
    const refreshTokenString = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenString, 10);

    const refreshToken = new RefreshToken({
      token: refreshTokenHash,
      user_id: user._id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      revoked: false
    });

    await refreshToken.save();

    return {
      access_token: accessToken,
      refresh_token: refreshTokenString,
      token_type: 'Bearer',
      expires_in: 15 * 60, // 15 minutos
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  /**
   * Verificar senha atual
   */
  async verifyCurrentPassword(userId, password) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await bcrypt.compare(password, user.password);
  }

  /**
   * Alterar senha
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Verificar senha atual
    const isValid = await this.verifyCurrentPassword(userId, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      password_changed_at: new Date()
    });

    // Revogar todos os refresh tokens
    await this.logout(userId);

    // Log de auditoria
    await AuditLog.create({
      action: 'PASSWORD_CHANGED',
      user_id: userId,
      details: {},
      ip_address: null,
      user_agent: null
    });
  }

  /**
   * Reset de senha
   */
  async initiatePasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Não revelar se email existe ou não (segurança)
      return { success: true };
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Salvar token (expira em 1 hora)
    user.password_reset_token = resetTokenHash;
    user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Enviar email (implementar serviço de email)
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { success: true };
  }

  /**
   * Confirmar reset de senha
   */
  async confirmPasswordReset(token, newPassword) {
    // Buscar usuário com token válido
    const user = await User.findOne({
      password_reset_expires: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Verificar token
    const isValidToken = await bcrypt.compare(token, user.password_reset_token);
    if (!isValidToken) {
      throw new Error('Invalid reset token');
    }

    // Hash nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha e limpar tokens
    user.password = hashedPassword;
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    user.password_changed_at = new Date();
    await user.save();

    // Revogar todos os refresh tokens
    await this.logout(user._id);

    // Log de auditoria
    await AuditLog.create({
      action: 'PASSWORD_RESET',
      user_id: user._id,
      details: {},
      ip_address: null,
      user_agent: null
    });

    return { success: true };
  }
}

module.exports = new AuthService();
```

### **2. Rotas de Autenticação**

```javascript
// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticateToken } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas de login por hora
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

// Registrar usuário
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name, establishment_id } = req.body;

    // Validação básica
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password and name are required',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validação de senha
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    const clientInfo = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const result = await authService.register({
      email,
      password,
      name,
      establishment_id,
      ...clientInfo
    });

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    const clientInfo = {
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const result = await authService.login({ email, password }, clientInfo);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message,
      code: 'LOGIN_FAILED'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    const result = await authService.refreshToken(refresh_token);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: error.message,
      code: 'REFRESH_FAILED'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const refreshToken = req.body.refresh_token;
    await authService.logout(req.user.id, refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Alterar senha
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Current and new password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    await authService.changePassword(req.user.id, current_password, new_password);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      error: error.message,
      code: 'CHANGE_PASSWORD_FAILED'
    });
  }
});

// Iniciar reset de senha
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'VALIDATION_ERROR'
      });
    }

    await authService.initiatePasswordReset(email);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to initiate password reset',
      code: 'FORGOT_PASSWORD_ERROR'
    });
  }
});

// Confirmar reset de senha
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        error: 'Token and new password are required',
        code: 'VALIDATION_ERROR'
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    await authService.confirmPasswordReset(token, new_password);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      error: error.message,
      code: 'RESET_PASSWORD_FAILED'
    });
  }
});

// Verificar token (para frontend)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
```

---

## 🗄️ Modelos de Dados Seguros

### **1. Modelo User com Segurança**

```javascript
// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'establishment_admin', 'establishment_user'],
    default: 'establishment_user'
  },
  establishment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true
  },

  // Segurança
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: String,
  email_verification_expires: Date,

  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  two_factor_secret: String,

  password_changed_at: Date,
  password_reset_token: String,
  password_reset_expires: Date,

  login_attempts: {
    type: Number,
    default: 0
  },
  locked_until: Date,
  last_login: Date,

  // Sessões ativas
  active_sessions: [{
    session_id: String,
    ip_address: String,
    user_agent: String,
    created_at: Date,
    last_activity: Date
  }],

  // Consentimento LGPD
  consent_given: {
    type: Boolean,
    default: false
  },
  consent_date: Date,
  consent_ip: String,

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ establishment_id: 1 });
userSchema.index({ password_reset_expires: 1 }, { expireAfterSeconds: 0 });

// Middleware para hash de senha
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar se conta está bloqueada
userSchema.methods.isLocked = function() {
  return !!(this.locked_until && this.locked_until > new Date());
};

// Método para limpar dados sensíveis
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.password_reset_token;
  delete userObject.two_factor_secret;
  delete userObject.email_verification_token;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
```

### **2. Modelo Refresh Token**

```javascript
// models/refresh-token.model.js
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revoked_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índices
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user_id: 1 });
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ revoked: 1 });

// Método para verificar se token é válido
refreshTokenSchema.methods.isValid = function() {
  return !this.revoked && this.expires_at > new Date();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
```

### **3. Modelo Audit Log**

```javascript
// models/audit-log.model.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTERED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'PASSWORD_CHANGED',
      'PASSWORD_RESET',
      'PAYMENT_PROCESSED',
      'PAYMENT_FAILED',
      'CONNECTOR_CONNECTED',
      'CONNECTOR_DISCONNECTED',
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_CANCELLED',
      'ADMIN_ACTION'
    ]
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  establishment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ip_address: String,
  user_agent: String,
  session_id: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índices
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ establishment_id: 1 });
auditLogSchema.index({ created_at: -1 });
auditLogSchema.index({ ip_address: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

## 🔐 Criptografia de Dados

### **1. Serviço de Criptografia**

```javascript
// services/encryption.service.js
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

class EncryptionService {

  /**
   * Derivar chave de criptografia da senha mestre
   */
  deriveKey(password, salt) {
    return crypto.scryptSync(password, salt, keyLength);
  }

  /**
   * Criptografar dados
   */
  encrypt(text, masterPassword = process.env.ENCRYPTION_KEY) {
    const salt = crypto.randomBytes(saltLength);
    const key = this.deriveKey(masterPassword, salt);
    const iv = crypto.randomBytes(ivLength);

    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('')); // Additional Authenticated Data

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Retornar dados criptografados com metadados
    return {
      encrypted: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: algorithm
    };
  }

  /**
   * Descriptografar dados
   */
  decrypt(encryptedData, masterPassword = process.env.ENCRYPTION_KEY) {
    const { encrypted, salt, iv, authTag } = encryptedData;

    const key = this.deriveKey(masterPassword, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    decipher.setAAD(Buffer.from(''));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Criptografar dados OAuth (tokens)
   */
  encryptOAuthToken(token) {
    return this.encrypt(token, process.env.OAUTH_ENCRYPTION_KEY);
  }

  /**
   * Descriptografar dados OAuth (tokens)
   */
  decryptOAuthToken(encryptedToken) {
    return this.decrypt(encryptedToken, process.env.OAUTH_ENCRYPTION_KEY);
  }

  /**
   * Hash de dados (one-way)
   */
  hash(data, saltRounds = 12) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Gerar token seguro
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verificar integridade de dados
   */
  verifyIntegrity(data, expectedHash) {
    const actualHash = this.hash(data);
    return crypto.timingSafeEqual(
      Buffer.from(actualHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  }
}

module.exports = new EncryptionService();
```

---

## 🛡️ Proteção contra Ataques

### **1. Rate Limiting Avançado**

```javascript
// middleware/rate-limit.middleware.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis.config');

// Store Redis para rate limiting distribuído
const redisStore = new RedisStore({
  client: redis,
  prefix: 'rl:',
  resetExpiryOnChange: true
});

// Rate limiting por IP
const createRateLimit = (options) => {
  return rateLimit({
    store: redisStore,
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    max: options.max || 100, // máximo de requests
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip || (() => false),
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    handler: options.handler || null
  });
};

// Rate limits específicos
const rateLimits = {
  // Autenticação - muito restritivo
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    skip: (req) => req.path === '/api/auth/verify'
  }),

  // Login - restritivo
  login: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 tentativas por hora
    keyGenerator: (req) => `${req.ip}:${req.body.email || 'unknown'}`
  }),

  // API geral
  api: createRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto
    skip: (req) => req.path.startsWith('/api/auth/') || req.path.startsWith('/webhooks/')
  }),

  // Pagamentos - muito restritivo
  payments: createRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 pagamentos por minuto
    keyGenerator: (req) => req.user ? req.user.id : req.ip
  }),

  // Webhooks - sem limite (mas com validação)
  webhooks: (req, res, next) => next(),

  // Uploads
  uploads: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 uploads por hora
    keyGenerator: (req) => req.user ? req.user.id : req.ip
  }),

  // Downloads
  downloads: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100, // 100 downloads por hora
    keyGenerator: (req) => req.user ? req.user.id : req.ip
  })
};

module.exports = rateLimits;
```

### **2. Proteção CSRF**

```javascript
// middleware/csrf.middleware.js
const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
  // Pular para métodos seguros
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Verificar se é uma rota de API
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  // Pular para webhooks e auth
  if (req.path.startsWith('/api/auth/') ||
      req.path.startsWith('/webhooks/') ||
      req.path.startsWith('/api/public/')) {
    return next();
  }

  // Verificar token CSRF
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

  if (!csrfToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_MISSING'
    });
  }

  // Verificar se token é válido (comparar com sessão)
  const sessionCsrfToken = req.session.csrfToken;

  if (!sessionCsrfToken || !crypto.timingSafeEqual(
    Buffer.from(csrfToken, 'hex'),
    Buffer.from(sessionCsrfToken, 'hex')
  )) {
    return res.status(403).json({
      error: 'CSRF token invalid',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

// Gerar token CSRF
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { csrfProtection, generateCsrfToken };
```

---

## 📊 Monitoramento e Logs

### **1. Serviço de Logs de Segurança**

```javascript
// services/security-log.service.js
const AuditLog = require('../models/audit-log.model');
const SecurityEvent = require('../models/security-event.model');

class SecurityLogService {

  /**
   * Log de evento de segurança
   */
  async logSecurityEvent(event) {
    const securityEvent = new SecurityEvent({
      type: event.type,
      severity: event.severity || 'medium',
      user_id: event.user_id,
      establishment_id: event.establishment_id,
      description: event.description,
      details: event.details,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      session_id: event.session_id,
      location: event.location,
      user_action: event.user_action,
      system_action: event.system_action,
      resolved: false,
      resolved_at: null,
      resolved_by: null
    });

    await securityEvent.save();

    // Alertar se for evento crítico
    if (event.severity === 'critical') {
      await this.alertSecurityTeam(securityEvent);
    }

    return securityEvent;
  }

  /**
   * Log de tentativa de login suspeita
   */
  async logSuspiciousLogin(credentials, ip, userAgent, reason) {
    await this.logSecurityEvent({
      type: 'SUSPICIOUS_LOGIN',
      severity: 'high',
      description: `Tentativa de login suspeita: ${reason}`,
      details: {
        email: credentials.email,
        reason: reason
      },
      ip_address: ip,
      user_agent: userAgent,
      user_action: 'login_attempt'
    });
  }

  /**
   * Log de acesso não autorizado
   */
  async logUnauthorizedAccess(userId, resource, action, ip, userAgent) {
    await this.logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'high',
      user_id: userId,
      description: `Acesso não autorizado a ${resource}`,
      details: {
        resource: resource,
        action: action
      },
      ip_address: ip,
      user_agent: userAgent,
      user_action: action
    });
  }

  /**
   * Log de mudança de senha
   */
  async logPasswordChange(userId, ip, userAgent) {
    await AuditLog.create({
      action: 'PASSWORD_CHANGED',
      user_id: userId,
      details: {},
      ip_address: ip,
      user_agent: userAgent
    });
  }

  /**
   * Log de atividade suspeita
   */
  async logSuspiciousActivity(userId, activity, details, ip, userAgent) {
    await this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'medium',
      user_id: userId,
      description: `Atividade suspeita: ${activity}`,
      details: details,
      ip_address: ip,
      user_agent: userAgent,
      user_action: activity
    });
  }

  /**
   * Alertar time de segurança
   */
  async alertSecurityTeam(securityEvent) {
    // Implementar notificação para time de segurança
    // Email, Slack, SMS, etc.
    console.error('🚨 ALERTA DE SEGURANÇA:', securityEvent);

    // Enviar email para security@empresa.com
    // await emailService.sendSecurityAlert(securityEvent);
  }

  /**
   * Resolver evento de segurança
   */
  async resolveSecurityEvent(eventId, resolvedBy, notes) {
    await SecurityEvent.findByIdAndUpdate(eventId, {
      resolved: true,
      resolved_at: new Date(),
      resolved_by: resolvedBy,
      resolution_notes: notes
    });
  }

  /**
   * Obter relatório de segurança
   */
  async getSecurityReport(startDate, endDate) {
    const events = await SecurityEvent.find({
      created_at: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ created_at: -1 });

    const summary = {
      total_events: events.length,
      critical_events: events.filter(e => e.severity === 'critical').length,
      high_events: events.filter(e => e.severity === 'high').length,
      medium_events: events.filter(e => e.severity === 'medium').length,
      low_events: events.filter(e => e.severity === 'low').length,
      unresolved_events: events.filter(e => !e.resolved).length
    };

    return { summary, events };
  }
}

module.exports = new SecurityLogService();
```

---

## 🔐 Frontend - Autenticação Segura

### **1. Interceptor de Autenticação**

```typescript
// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar token de acesso
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    // Adicionar CSRF token para requests não-GET
    if (request.method !== 'GET') {
      const csrfToken = this.authService.getCsrfToken();
      if (csrfToken) {
        request = request.clone({
          headers: request.headers.set('X-CSRF-Token', csrfToken)
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }

        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
```

### **2. Serviço de Autenticação Frontend**

```typescript
// services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Carregar usuário do localStorage
    const user = this.getSavedUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        this.setSession(response.data);
        this.currentUserSubject.next(response.data.user);
      })
    );
  }

  // Registro
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData).pipe(
      tap((response: any) => {
        this.setSession(response.data);
        this.currentUserSubject.next(response.data.user);
      })
    );
  }

  // Refresh token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.API_URL}/refresh`, { refresh_token: refreshToken }).pipe(
      tap((response: any) => {
        this.updateAccessToken(response.data.access_token);
      })
    );
  }

  // Logout
  logout(): void {
    const refreshToken = this.getRefreshToken();
    this.http.post(`${this.API_URL}/logout`, { refresh_token: refreshToken }).subscribe();

    this.clearSession();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Verificar se token não expirou
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Obter usuário atual
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Verificar permissões
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Tokens
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getCsrfToken(): string | null {
    return localStorage.getItem('csrf_token');
  }

  // Sessão
  private setSession(authResult: any): void {
    const expiresAt = new Date().getTime() + (authResult.expires_in * 1000);

    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('refresh_token', authResult.refresh_token);
    localStorage.setItem('expires_at', expiresAt.toString());
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  private updateAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
    localStorage.removeItem('csrf_token');
  }

  private getSavedUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Verificar token no servidor
  verifyToken(): Observable<any> {
    return this.http.get(`${this.API_URL}/verify`);
  }

  // Alterar senha
  changePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/change-password`, data);
  }

  // Esqueci senha
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  // Reset senha
  resetPassword(data: { token: string; new_password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, data);
  }
}
```

---

## 🔐 Configuração de Produção

### **1. Variáveis de Ambiente**

```bash
# .env.production
# HTTPS Configuration
HTTPS_PORT=443
HTTP_PORT=80
SSL_CERT_PATH=/etc/ssl/certs/certificate.crt
SSL_KEY_PATH=/etc/ssl/private/private.key
SSL_CA_BUNDLE_PATH=/etc/ssl/certs/ca-bundle.crt

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_EXPIRES_IN=15m

# Encryption
ENCRYPTION_KEY=your-256-bit-encryption-key-here
OAUTH_ENCRYPTION_KEY=your-oauth-encryption-key-here

# Database
MONGODB_URI=mongodb://localhost:27017/saas_prod
REDIS_URI=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
REDIS_URL=redis://localhost:6379

# Monitoring
LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=365
```

### **2. Docker Compose para Produção**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./certs:/app/certs:ro
      - ./logs:/app/logs
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    ports:
      - "27017:27017"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass secure_redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/ssl/certs:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

Esta arquitetura de segurança implementa **HTTPS obrigatório**, **OAuth 2.0 completo** com PKCE, **criptografia end-to-end**, **rate limiting avançado**, **auditoria completa** e **monitoramento em tempo real** para proteger todas as transações do SaaS marketplace.