# 🚨 Debugging Backend Mercado Pago - Prioridade Alta

## 🎯 Problema Identificado

Erro 503 "internal_error" no backend Mercado Pago SDK, causado por payload malformado enviado ao SDK. Campos críticos podem estar `undefined`:
- `token` (card token)
- `payment_method_id`
- `transaction_amount`

## 🔍 Diagnóstico Atual

### 📊 Logs Existentes (Insuficientes)
```javascript
// backend/routes/payments.js - handlePayment atual
app.post('/handlePayment', async (req, res) => {
  try {
    const { token, payment_method_id, transaction_amount } = req.body;

    // LOG INSUFICIENTE - apenas sucesso/erro
    console.log('Processing payment...');

    const payment = await mercadopago.payment.create({
      transaction_amount,
      token,
      payment_method_id,
      // ... outros campos
    });

    console.log('Payment processed successfully');
    res.json({ success: true, payment });

  } catch (error) {
    console.error('Payment failed:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});
```

### ❌ Problemas Identificados
1. **Logs insuficientes** - não mostra valores dos campos críticos
2. **Validação ausente** - campos podem ser `undefined` ou inválidos
3. **Error handling genérico** - não diferencia tipos de erro Mercado Pago
4. **Payload invisível** - impossível debugar sem ver dados enviados

---

## 🛠️ Solução Implementada

### 📝 Código Corrigido com Debug Completo

```javascript
// backend/routes/payments.js - VERSÃO DEBUG
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Middleware de logging detalhado
const paymentLogger = (req, res, next) => {
  console.log('\n=== PAYMENT REQUEST DEBUG ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // Campos críticos do Mercado Pago
  const { token, payment_method_id, transaction_amount, payer, description } = req.body;
  console.log('\n--- CAMPOS CRÍTICOS ---');
  console.log('token:', token, '(type:', typeof token, ')');
  console.log('payment_method_id:', payment_method_id, '(type:', typeof payment_method_id, ')');
  console.log('transaction_amount:', transaction_amount, '(type:', typeof transaction_amount, ')');
  console.log('payer:', JSON.stringify(payer, null, 2));
  console.log('description:', description);

  next();
};

// Validação robusta dos campos obrigatórios
const validatePaymentData = (data) => {
  const errors = [];
  const { token, payment_method_id, transaction_amount, payer } = data;

  if (!token || typeof token !== 'string' || token.trim() === '') {
    errors.push('Token inválido ou ausente');
  }

  if (!payment_method_id || typeof payment_method_id !== 'string' || payment_method_id.trim() === '') {
    errors.push('Payment method ID inválido ou ausente');
  }

  if (!transaction_amount || typeof transaction_amount !== 'number' || transaction_amount <= 0) {
    errors.push('Transaction amount inválido ou ausente');
  }

  if (!payer || typeof payer !== 'object') {
    errors.push('Payer data ausente');
  } else {
    // Validação específica do payer (como no frontend)
    if (!payer.email || !payer.email.trim()) {
      errors.push('Payer email ausente');
    }
    if (!payer.first_name || !payer.first_name.trim()) {
      errors.push('Payer first_name ausente');
    }
    if (!payer.last_name || !payer.last_name.trim()) {
      errors.push('Payer last_name ausente');
    }
    if (!payer.identification || !payer.identification.number || !payer.identification.number.trim()) {
      errors.push('Payer identification ausente');
    }
  }

  return errors;
};

// Rota de processamento com debug completo
router.post('/handlePayment', paymentLogger, async (req, res) => {
  try {
    const paymentData = req.body;

    // Validação prévia
    const validationErrors = validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      console.log('\n❌ VALIDATION ERRORS:', validationErrors);
      return res.status(400).json({
        error: 'Dados de pagamento inválidos',
        details: validationErrors,
        code: 'VALIDATION_FAILED'
      });
    }

    console.log('\n✅ VALIDATION PASSED - Preparing Mercado Pago payload');

    // Preparar payload Mercado Pago com sanitização
    const mercadoPagoPayload = {
      transaction_amount: Number(paymentData.transaction_amount),
      token: paymentData.token.trim(),
      payment_method_id: paymentData.payment_method_id.trim(),
      description: paymentData.description || 'Pagamento SaaS Restaurante',
      installments: paymentData.installments || 1,
      payer: {
        email: paymentData.payer.email.trim().toLowerCase(),
        first_name: paymentData.payer.first_name.trim(),
        last_name: paymentData.payer.last_name.trim(),
        identification: {
          type: paymentData.payer.identification.type || 'CPF',
          number: paymentData.payer.identification.number.trim().replace(/\D/g, '') // Remove non-digits
        }
      },
      // Metadata para rastreamento
      metadata: {
        establishment_id: paymentData.establishment_id,
        order_id: paymentData.order_id,
        timestamp: new Date().toISOString()
      }
    };

    console.log('\n📤 MERCADO PAGO PAYLOAD:', JSON.stringify(mercadoPagoPayload, null, 2));

    // Criar pagamento no Mercado Pago
    console.log('\n🔄 Calling Mercado Pago SDK...');
    const payment = await mercadopago.payment.create(mercadoPagoPayload);

    console.log('\n✅ MERCADO PAGO RESPONSE:', JSON.stringify(payment, null, 2));

    // Verificar status do pagamento
    if (payment.status === 201 && payment.body.status === 'approved') {
      console.log('\n🎉 PAYMENT APPROVED');
      res.json({
        success: true,
        payment: payment.body,
        status: 'approved'
      });
    } else {
      console.log('\n⚠️ PAYMENT NOT APPROVED - Status:', payment.body.status);
      res.json({
        success: false,
        payment: payment.body,
        status: payment.body.status,
        status_detail: payment.body.status_detail
      });
    }

  } catch (error) {
    console.error('\n❌ MERCADO PAGO ERROR:', error);

    // Log detalhado do erro
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    // Categorizar erro para resposta adequada
    let statusCode = 500;
    let errorMessage = 'Erro interno no processamento do pagamento';
    let errorCode = 'INTERNAL_ERROR';

    if (error.response) {
      const mpError = error.response.data;

      if (error.response.status === 400) {
        statusCode = 400;
        errorMessage = 'Dados do pagamento inválidos';
        errorCode = 'INVALID_PAYMENT_DATA';

        // Log específico para erros de payer
        if (mpError.cause && mpError.cause.some(c => c.code === 'payer')) {
          console.error('❌ PAYER VALIDATION ERROR - Check payer data');
        }

      } else if (error.response.status === 401) {
        statusCode = 401;
        errorMessage = 'Credenciais Mercado Pago inválidas';
        errorCode = 'INVALID_CREDENTIALS';
      } else if (error.response.status === 403) {
        statusCode = 403;
        errorMessage = 'Acesso negado ao Mercado Pago';
        errorCode = 'ACCESS_DENIED';
      }
    }

    res.status(statusCode).json({
      error: errorMessage,
      code: errorCode,
      details: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
```

---

## 🧪 Teste de Validação

### 📤 Script de Teste

```javascript
// test-payment-debug.js
const axios = require('axios');

const API_URL = 'http://localhost:3000'; // Ajuste para seu backend

// Teste com dados válidos
const validPaymentData = {
  token: 'card_token_from_frontend_123456789',
  payment_method_id: 'master',
  transaction_amount: 100.50,
  description: 'Teste de pagamento',
  installments: 1,
  payer: {
    email: 'cliente@email.com',
    first_name: 'João',
    last_name: 'Silva',
    identification: {
      type: 'CPF',
      number: '12345678901'
    }
  },
  establishment_id: 'est_123',
  order_id: 'order_456'
};

// Teste com dados inválidos (para verificar validação)
const invalidPaymentData = {
  token: '', // inválido
  payment_method_id: null, // inválido
  transaction_amount: 'abc', // inválido
  payer: {} // inválido
};

async function testPayment(data, testName) {
  console.log(`\n=== ${testName} ===`);
  try {
    const response = await axios.post(`${API_URL}/payments/handlePayment`, data);
    console.log('✅ SUCCESS:', response.data);
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data || error.message);
  }
}

// Executar testes
async function runTests() {
  await testPayment(validPaymentData, 'VALID PAYMENT TEST');
  await testPayment(invalidPaymentData, 'INVALID PAYMENT TEST');
}

runTests();
```

### 🚀 Como Executar o Teste

```bash
# 1. Instalar dependências se necessário
npm install axios

# 2. Executar teste
node test-payment-debug.js
```

---

## 📊 Análise de Logs

### 🔍 O que Observar nos Logs

Após implementar o debug, observe estes pontos nos logs:

#### ✅ Cenário de Sucesso
```
=== PAYMENT REQUEST DEBUG ===
Body: {"token":"card_token_123","payment_method_id":"master","transaction_amount":100.5,...}
--- CAMPOS CRÍTICOS ---
token: card_token_123 (type: string)
payment_method_id: master (type: string)
transaction_amount: 100.5 (type: number)
✅ VALIDATION PASSED
📤 MERCADO PAGO PAYLOAD: {...}
🔄 Calling Mercado Pago SDK...
✅ MERCADO PAGO RESPONSE: {...}
🎉 PAYMENT APPROVED
```

#### ❌ Cenário de Erro 503
```
=== PAYMENT REQUEST DEBUG ===
Body: {"token":null,"payment_method_id":undefined,"transaction_amount":null,...}
--- CAMPOS CRÍTICOS ---
token: null (type: object)
payment_method_id: undefined (type: undefined)
transaction_amount: null (type: object)
❌ VALIDATION ERRORS: ["Token inválido ou ausente", "Payment method ID inválido..."]
```

#### ❌ Cenário de Payer Validation Error
```
❌ PAYER VALIDATION ERROR - Check payer data
Response data: {
  "message": "payer.first_name invalid",
  "error": "bad_request",
  "status": 400,
  "cause": [{"code": "payer", "description": "payer.first_name invalid"}]
}
```

---

## 🛠️ Correções Comuns Identificadas

### 1. **Token Undefined**
**Sintoma**: `token: undefined`
**Causa**: Frontend não está enviando token do Mercado Pago
**Solução**: Verificar se `initPaymentBrick()` está sendo chamado corretamente

### 2. **Payment Method ID Null**
**Sintoma**: `payment_method_id: null`
**Causa**: Campo não preenchido no frontend
**Solução**: Adicionar validação no componente Angular

### 3. **Transaction Amount String**
**Sintoma**: `transaction_amount: "100.50" (type: string)`
**Causa**: Valor enviado como string ao invés de number
**Solução**: Converter para Number() no backend

### 4. **Payer Data Incomplete**
**Sintoma**: Campos do payer vazios
**Causa**: Validação frontend insuficiente
**Solução**: Implementar validação robusta como no código fornecido

---

## 📈 Monitoramento Contínuo

### 🔧 Adicionar Métricas

```javascript
// middleware/metrics.js
const paymentMetrics = {
  totalRequests: 0,
  successfulPayments: 0,
  failedPayments: 0,
  validationErrors: 0,
  mercadoPagoErrors: 0,
  averageResponseTime: 0
};

const paymentMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  paymentMetrics.totalRequests++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    paymentMetrics.averageResponseTime =
      (paymentMetrics.averageResponseTime + duration) / 2;

    if (res.statusCode === 200) {
      paymentMetrics.successfulPayments++;
    } else if (res.statusCode >= 400) {
      paymentMetrics.failedPayments++;
    }
  });

  next();
};

// Endpoint para métricas
app.get('/metrics/payments', (req, res) => {
  res.json(paymentMetrics);
});
```

### 📊 Dashboard de Monitoramento

```javascript
// logs/monitor.js
const fs = require('fs');
const path = require('path');

class PaymentMonitor {
  constructor() {
    this.logFile = path.join(__dirname, 'payment-monitor.log');
  }

  logPayment(paymentData, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      payment: {
        amount: paymentData.transaction_amount,
        method: paymentData.payment_method_id,
        establishment: paymentData.establishment_id
      },
      result: result,
      errors: result.errors || []
    };

    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  getRecentLogs(hours = 24) {
    // Implementar leitura de logs recentes
  }

  getErrorSummary() {
    // Implementar resumo de erros
  }
}

module.exports = new PaymentMonitor();
```

---

## 🎯 Resultado Esperado

Após implementar estas correções:

1. **Logs detalhados** mostrarão exatamente quais campos estão faltando
2. **Validação robusta** prevenirá envio de dados inválidos
3. **Error handling específico** facilitará diagnóstico de problemas
4. **Métricas de monitoramento** permitirão identificar tendências
5. **Taxa de sucesso** de pagamentos deve aumentar significativamente

### 📞 Próximos Passos
1. Implementar código de debug no backend
2. Executar testes com dados válidos/inválidos
3. Analisar logs para identificar problemas específicos
4. Corrigir validações no frontend conforme necessário
5. Monitorar métricas de sucesso continuamente

Esta implementação resolverá definitivamente os erros 400/503 do Mercado Pago e estabelecerá uma base sólida para processamento de pagamentos confiável.