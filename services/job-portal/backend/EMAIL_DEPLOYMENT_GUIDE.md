# Email Configuration & Render Deployment Guide

## ✅ Current Status
Your nodemailer setup is **production-ready** and will work on Render with proper environment variables.

## 🔧 Recent Improvements Made

### 1. **Connection Pooling**
- Uses a singleton transporter instance for better performance
- Prevents creating new connections for each email
- Configurable connection limits (5 max connections, 100 messages per connection)

### 2. **Timeout Configurations**
- Connection timeout: 10 seconds
- Greeting timeout: 10 seconds  
- Socket timeout: 30 seconds
- Prevents hanging connections in production

### 3. **Rate Limiting**
- Max 5 messages per second
- Prevents Gmail blocking due to spam-like behavior

### 4. **Enhanced Error Handling**
- Specific error messages for auth failures (`EAUTH`)
- Connection errors (`ECONNECTION`)
- Timeout errors (`ETIMEDOUT`)
- Better debugging in development mode

### 5. **TLS/SSL Security**
- Auto-detects SSL (port 465) vs TLS (port 587)
- Enforces TLS 1.2 minimum
- Certificate validation in production

### 6. **Validation**
- Checks for required environment variables on startup
- Clear error messages if configuration is incomplete

---

## 📧 Gmail App Password Setup

Since you're using Gmail (`meetsanwadkarofficial@gmail.com`), you need an **App Password**:

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google," enable **2-Step Verification**

### Step 2: Generate App Password
1. Visit https://myaccount.google.com/apppasswords
2. Select **App**: "Mail"
3. Select **Device**: "Other" (type: "Job Portal Backend")
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Use this password in `EMAIL_PASS` environment variable (remove spaces)

**Your current password in .env looks like an app password already**: `erku dwvq umyq mrzt` ✅

---

## 🚀 Render Deployment Steps

### Step 1: Create Render Web Service
1. Go to https://render.com/
2. Click **New** → **Web Service**
3. Connect your GitHub repository:
   - Repository: `Minimalistic-Technology/UAT`
   - Root Directory: `services/job-portal/backend`

### Step 2: Configure Build Settings
```
Name: job-portal-backend
Environment: Node
Region: Oregon (US West) or closest to your users
Branch: main (or your deployment branch)

Build Command: npm install && npm run build
Start Command: node dist/index.js
```

### Step 3: Add Environment Variables

In Render's **Environment** section, add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | Render will override to 10000 |
| `MONGO_URI` | `mongodb+srv://...` | Use MongoDB Atlas |
| `JWT_SECRET` | `[generate new]` | Use crypto to generate |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `EMAIL_HOST` | `smtp.gmail.com` | Gmail SMTP |
| `EMAIL_PORT` | `587` | TLS port |
| `EMAIL_USER` | `meetsanwadkarofficial@gmail.com` | Your Gmail |
| `EMAIL_PASS` | `erku dwvq umyq mrzt` | Your app password |
| `CLIENT_URL` | `https://your-frontend.onrender.com` | Frontend URL |
| `CLOUDINARY_NAME` | `dgvwhfdp0` | From your .env |
| `CLOUDINARY_API_KEY` | `832784279878417` | From your .env |
| `CLOUDINARY_API_SECRET` | `xS5Q-3hZ9fpSwT1PIobHo-uU8xY` | From your .env |

**Optional (if using):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### Step 4: Generate Secure JWT_SECRET

Run this command locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET` on Render.

### Step 5: Database Setup

**Don't use localhost in production!** Use MongoDB Atlas:

1. Go to https://cloud.mongodb.com/
2. Create a free cluster
3. Add a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/job-portal?retryWrites=true&w=majority
   ```
6. Use this as `MONGO_URI` on Render

### Step 6: CORS Configuration

Update `CLIENT_URL` to your **deployed frontend URL**:
```
CLIENT_URL=https://your-frontend-app.onrender.com
```

This ensures CORS allows requests from your production frontend.

---

## 🔍 Testing Email on Render

After deployment, test the forgot password feature:

### Test Request (from Postman or your frontend):
```bash
POST https://your-backend.onrender.com/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test-user@example.com"
}
```

### Check Render Logs:
1. Go to your Render dashboard
2. Click on your service
3. Go to **Logs** tab
4. Look for:
   - ✅ `Email server is ready to send messages` (only in dev mode)
   - ✉️ `Email sent successfully: <messageId>`
   - ❌ Error messages if something failed

---

## 🐛 Troubleshooting

### Error: "Email authentication failed"
- **Cause**: Wrong `EMAIL_USER` or `EMAIL_PASS`
- **Fix**: Regenerate Gmail App Password and update `EMAIL_PASS`

### Error: "Could not connect to email server"
- **Cause**: Wrong `EMAIL_HOST` or `EMAIL_PORT`
- **Fix**: Verify `EMAIL_HOST=smtp.gmail.com` and `EMAIL_PORT=587`

### Error: "ETIMEDOUT"
- **Cause**: Network/firewall blocking SMTP
- **Fix**: Render typically allows outbound SMTP. Contact Render support if persistent.

### Emails Not Arriving
1. Check spam/junk folder
2. Verify `EMAIL_USER` is correct
3. Check Render logs for "Email sent successfully"
4. Check Gmail's "Sent" folder
5. Gmail might block if sending too many emails too quickly (rate limiting is set to 5/sec)

### Gmail Blocking Emails
- **Cause**: Too many emails in short time or suspicious activity
- **Fix**: 
  - Wait a few hours and try again
  - Verify account at https://www.google.com/accounts/DisplayUnlockCaptcha
  - Consider using SendGrid or Mailgun for production

---

## 📊 Email Monitoring

To monitor email deliverability in production:

1. **Check Render Logs**: All email attempts are logged
2. **Gmail Sent Folder**: Verify emails are being sent
3. **Error Tracking**: Consider adding Sentry or similar for error tracking

---

## 🔄 Alternative SMTP Providers (Recommended for Production)

While Gmail works, consider these for better reliability:

### 1. **SendGrid** (Recommended)
- Free tier: 100 emails/day
- Better deliverability
- Detailed analytics
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### 2. **Mailgun**
- Free tier: 5,000 emails/month
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-smtp-password
```

### 3. **AWS SES**
- Cheapest for high volume
- Requires domain verification
```
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
```

---

## ✅ Production Checklist

Before deploying:

- [ ] Generated secure `JWT_SECRET`
- [ ] Using MongoDB Atlas (not localhost)
- [ ] Verified Gmail App Password works locally
- [ ] Set `CLIENT_URL` to production frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] All environment variables added to Render
- [ ] Tested forgot password flow locally
- [ ] Cloudinary credentials are correct
- [ ] Added `.env` to `.gitignore` (don't commit secrets!)

---

## 📝 Summary

Your nodemailer configuration is **production-ready**. The improvements made include:
- Connection pooling for performance
- Comprehensive error handling
- Timeout protection
- Rate limiting
- TLS/SSL security
- Configuration validation

Just add the environment variables to Render and your email functionality will work seamlessly! 🎉
