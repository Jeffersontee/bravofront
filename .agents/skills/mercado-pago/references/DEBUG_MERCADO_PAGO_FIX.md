# 🐛 Mercado Pago Payment Error - Debug Guide & Fix

## ❌ Error Identified

```
Erro no processamento: 
"Erro nos dados do pagador. Certifique-se de usar um usuário de teste válido do Mercado Pago."
Error: "invalid json response body at https://api.mercadopago.com/v1/payments 
reason: Unexpected end of JSON input"
```

### Root Cause
The **payer data** sent to the backend had validation issues:
- Missing or empty `first_name` / `last_name`
- Invalid or missing `email`
- Malformed `cpf` (CPF/identification number)

---

## ✅ Fixes Applied

### 1. **Component** (`mercado-pago.component.ts`)
- ✅ Added robust name parsing with fallback values
- ✅ Proper email extraction with multiple fallback sources
- ✅ CPF validation and formatting (11 digits required)
- ✅ Enhanced error handling for payer validation errors
- ✅ Debug logging to track payer data

### 2. **Service** (`mercado-pago.service.ts`)
- ✅ Consistent payer data sanitization in Brick initialization
- ✅ Pre-submission validation of payer fields
- ✅ Better CPF format handling
- ✅ Validation error messages are clear and actionable

---

## 🧪 Testing Instructions

### Test Credentials (Mercado Pago Sandbox)

#### Buyer Account
```
Email: c834801@test.com
User ID: 3361329338
Username: TESTUSER4758639813194551122
Password: u5mndXLkUZ
Verification Code: 329338
```

#### Seller Account  
```
Email: adm51080@test.com
User ID: 3370454581
Username: TESTUSER2039317307949433223
Password: h998VEhiOd
Verification Code: 454581
```

### Step-by-Step Testing

1. **Ensure Profile is Complete**
   - User email must be set (not empty or undefined)
   - User full name must be present (at least first + last name)
   - CPF must be provided (fallback: `31852997877` for testing)

2. **Test with PIX (Recommended for Quick Testing)**
   - Navigate to payment checkout
   - Select PIX as payment method
   - Should display QR code without payer validation errors

3. **Test with Credit Card**
   - Use test credit card data from Mercado Pago
   - Should properly validate payer data before submission

4. **Monitor Browser Console**
   - Look for `🔍 [PAYER DEBUG]` logs showing extracted data
   - Look for `✅ [VALIDATION SUCCESS]` logs confirming validation passed
   - Look for `❌ [PAYER VALIDATION ERROR]` if validation failed

---

## 🔍 How to Debug if Error Persists

### Check These Browser Console Logs

```javascript
// Before payment is sent, you should see:
🔍 [PAYER DEBUG] {
  email: "c834801@test.com",
  first_name: "Cliente",
  last_name: "Pinguins",
  cpf: "31852997877",
  originalProfile: { /* profile object */ },
  originalBrickData: { /* brick form data */ }
}

// After validation passes:
✅ [VALIDATION SUCCESS] Dados do pagador validados: {
  email: "c834801@test.com",
  first_name: "Cliente",
  last_name: "Pinguins",
  cpf: "***-877"
}
```

### If You Still See Payer Errors

1. **Check Profile Data**
   ```typescript
   // In browser console, verify:
   console.log(window.localStorage.getItem('profile')) // Your profile data
   ```

2. **Verify Backend Receives Data Correctly**
   - Add logs in your Node.js backend `/payments/handlePayment` endpoint
   - Log the incoming `payload.payer` object
   - Verify it matches Mercado Pago's required format

3. **Test Empty Cases**
   ```javascript
   // Temporarily set minimal profile to test fallbacks
   const testProfile = {
     name: 'Test User',
     email: 'c834801@test.com',
     cpf: '31852997877'
   };
   ```

---

## 📋 Required Payer Fields for Mercado Pago API

Your backend MUST send exactly this format to Mercado Pago:

```json
{
  "payer": {
    "email": "c834801@test.com",
    "first_name": "Your First Name",
    "last_name": "Your Last Name",
    "identification": {
      "type": "CPF",
      "number": "31852997877"
    }
  }
}
```

**Key Requirements:**
- ✅ `email`: Valid email format (not empty)
- ✅ `first_name`: At least 1 character (not empty or whitespace only)
- ✅ `last_name`: At least 1 character (not empty or whitespace only)
- ✅ `identification.number`: Exactly 11 digits for CPF (no special chars)

---

## 🚀 Next Steps

1. **Test the fix with your test buyer account**
   - Email: `c834801@test.com`
   - Ensure this user has complete profile data

2. **Verify backend logs**
   - Check that backend is receiving valid payer data
   - Confirm backend is sending proper JSON to Mercado Pago API

3. **If Still Failing**
   - Share backend logs from `/payments/handlePayment` endpoint
   - Share the exact response from Mercado Pago API
   - Check if the issue is in how backend formats the request

---

## 📝 Code Changes Summary

| File | Change | Benefit |
|------|--------|---------|
| `mercado-pago.component.ts` | Robust name/email parsing, validation logging | Prevents empty/invalid payer data |
| `mercado-pago.service.ts` | Pre-submission validation method | Catches errors before sending to backend |
| Both | Consistent sanitization logic | Unified data formatting across components |

---

## ❓ Common Questions

**Q: Why "invalid json response body"?**
A: Backend sent malformed JSON to Mercado Pago, likely due to empty payer fields.

**Q: Why use default CPF `31852997877`?**
A: This is Mercado Pago's standard test CPF. Use it when real CPF is unavailable.

**Q: Should profile have email?**
A: Yes! Email is mandatory. If missing, check how user data is fetched after login.

---

## 📞 Support

If the error persists:
1. Check browser console for `[PAYER DEBUG]` and `[VALIDATION SUCCESS]` logs
2. Verify profile data has email and name
3. Check backend logs for the actual payload sent to Mercado Pago
4. Ensure backend is using the correct Mercado Pago API credentials
