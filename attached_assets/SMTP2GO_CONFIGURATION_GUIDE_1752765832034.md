# SMTP2GO Configuration Guide for Programmers

## Overview

This guide provides practical insights and solutions for configuring SMTP2GO in your Node.js/Express application, based on real implementation experience. It covers common pitfalls, working solutions, and best practices.

## Table of Contents

1. [Critical Configuration Issues](#critical-configuration-issues)
2. [Step-by-Step Setup](#step-by-step-setup)
3. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
4. [Database Schema Design](#database-schema-design)
5. [Security and Rate Limiting](#security-and-rate-limiting)
6. [Testing and Debugging](#testing-and-debugging)
7. [Production Considerations](#production-considerations)

## Critical Configuration Issues

### 1. Port and Security Settings (The #1 Gotcha)

**The Problem**: Most developers get the port and security configuration wrong, leading to authentication failures.

```typescript
// ❌ WRONG - This will fail with authentication errors
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  secure: true,  // This breaks everything!
  auth: {
    user: 'username',
    pass: 'password'
  }
});

// ✅ CORRECT - This works perfectly
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  secure: false,     // Never true for port 2525
  requireTLS: true,  // Always true for SMTP2GO
  auth: {
    user: 'username',
    pass: 'password'
  }
});
```

**The Golden Rule**:
- Port 2525: `secure: false, requireTLS: true` (Recommended)
- Port 587: `secure: false, requireTLS: true`
- Port 465: `secure: true, requireTLS: false`

### 2. Method Name Typo

**Common Error**: Using `nodemailer.createTransporter()` instead of `nodemailer.createTransport()`

```typescript
// ❌ WRONG - Function doesn't exist
const transporter = nodemailer.createTransporter(config);

// ✅ CORRECT - Proper method name
const transporter = nodemailer.createTransport(config);
```

### 3. Dynamic vs Static Configuration

**The Problem**: Hardcoding SMTP settings makes your app inflexible and insecure.

```typescript
// ❌ WRONG - Hardcoded values
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: 'hardcoded@email.com',  // Bad practice
    pass: 'hardcoded-password'    // Security risk
  }
});

// ✅ CORRECT - Dynamic from database/environment
async function createTransporter() {
  const settings = await getSmtpSettings(); // From database
  if (!settings) {
    throw new Error('SMTP settings not configured');
  }
  
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    requireTLS: settings.smtpPort === 2525 || settings.smtpPort === 587,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
}
```

## Step-by-Step Setup

### 1. Get SMTP2GO Credentials

1. Sign up at [smtp2go.com](https://smtp2go.com)
2. Get your username (can be email address or API username)
3. Get your password or API key
4. Verify your domain if using custom from address

### 2. Install Required Dependencies

```bash
npm install nodemailer express-rate-limit
npm install --save-dev @types/nodemailer
```

### 3. Set Up Environment Variables

```bash
# .env file
SMTP2GO_USERNAME=your_username_or_email
SMTP2GO_PASSWORD=your_password_or_api_key
DATABASE_URL=your_database_url
```

### 4. Create Database Schema

```sql
-- Email history table
CREATE TABLE email_history (
  id SERIAL PRIMARY KEY,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  timestamp TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);

-- SMTP settings table
CREATE TABLE smtp_settings (
  id SERIAL PRIMARY KEY,
  configuration_name TEXT NOT NULL DEFAULT 'SMTP2GO',
  smtp_host TEXT NOT NULL DEFAULT 'mail.smtp2go.com',
  smtp_port INTEGER NOT NULL DEFAULT 2525,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'Email App',
  use_ssl BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Implement the Transporter Function

```typescript
import nodemailer from 'nodemailer';

async function createTransporter() {
  const settings = await getSmtpSettings();
  if (!settings) {
    throw new Error('No SMTP settings found. Please configure SMTP settings first.');
  }
  
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // Only secure for port 465
    requireTLS: settings.smtpPort === 2525 || settings.smtpPort === 587,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
}
```

### 6. Add Connection Testing

```typescript
// Always test connection before sending emails
app.post('/api/smtp/test', async (req, res) => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    res.json({ message: 'SMTP connection successful', status: 'connected' });
  } catch (error) {
    res.status(500).json({ 
      message: 'SMTP connection failed', 
      error: error.message,
      status: 'failed'
    });
  }
});
```

### 7. Implement Email Sending with History

```typescript
app.post('/api/email/send', async (req, res) => {
  try {
    const validatedData = validateEmailData(req.body);
    const transporter = await createTransporter();
    const settings = await getSmtpSettings();
    
    const mailOptions = {
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: validatedData.to,
      subject: validatedData.subject,
      text: validatedData.message,
      html: validatedData.message.replace(/\n/g, '<br>'),
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      
      // Store successful email in history
      await createEmailHistory({
        to: validatedData.to,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'sent',
        errorMessage: null,
      });

      res.json({ 
        message: 'Email sent successfully',
        messageId: result.messageId 
      });
    } catch (error) {
      // Store failed email in history
      await createEmailHistory({
        to: validatedData.to,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'failed',
        errorMessage: error.message,
      });

      res.status(500).json({ 
        message: 'Failed to send email',
        error: error.message
      });
    }
  } catch (error) {
    res.status(400).json({ 
      message: 'Invalid email data',
      error: error.message
    });
  }
});
```

## Common Mistakes to Avoid

### 1. Wrong SSL Configuration
- **Never** set `secure: true` for ports 2525 or 587
- **Always** set `requireTLS: true` for SMTP2GO

### 2. Not Testing Connection First
- Always implement a test endpoint
- Verify connection before attempting to send emails

### 3. Ignoring Failed Emails
- Store both successful and failed email attempts
- Include error messages for debugging

### 4. Hardcoding Settings
- Use environment variables for credentials
- Store configuration in database for flexibility

### 5. Missing Rate Limiting
- Implement rate limiting to prevent abuse
- Consider both per-IP and per-user limits

## Database Schema Design

### Email History Table
```sql
CREATE TABLE email_history (
  id SERIAL PRIMARY KEY,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  timestamp TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);
```

### SMTP Settings Table
```sql
CREATE TABLE smtp_settings (
  id SERIAL PRIMARY KEY,
  configuration_name TEXT NOT NULL DEFAULT 'SMTP2GO',
  smtp_host TEXT NOT NULL DEFAULT 'mail.smtp2go.com',
  smtp_port INTEGER NOT NULL DEFAULT 2525,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'Email App',
  use_ssl BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security and Rate Limiting

### Rate Limiting Implementation
```typescript
import rateLimit from 'express-rate-limit';

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 emails per windowMs
  message: { message: 'Too many emails sent, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/email/send', emailLimiter, async (req, res) => {
  // Email sending logic
});
```

### Trust Proxy Configuration
```typescript
// For production deployment
app.set('trust proxy', true);
```

### Input Validation
```typescript
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});
```

## Testing and Debugging

### 1. Connection Testing
```bash
# Test SMTP connection
curl -X POST http://localhost:5000/api/smtp/test
```

### 2. Email Sending Test
```bash
# Test email sending
curl -X POST http://localhost:5000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

### 3. Database Verification
```sql
-- Check email history
SELECT * FROM email_history ORDER BY timestamp DESC;

-- Check SMTP settings
SELECT * FROM smtp_settings WHERE is_active = true;
```

### 4. Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "535 Incorrect authentication data" | Wrong username/password or SSL settings | Check credentials and use correct port settings |
| "createTransporter is not a function" | Wrong method name | Use `createTransport` instead of `createTransporter` |
| "ENOTFOUND mail.smtp2go.com" | Network/DNS issue | Check internet connection and firewall |
| "Too many re-renders" | React state update in render loop | Use useEffect for form updates |

## Production Considerations

### 1. Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
SMTP2GO_USERNAME=your_username
SMTP2GO_PASSWORD=your_password
```

### 2. Health Checks
```typescript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await testDatabaseConnection();
    
    // Check SMTP connection
    const transporter = await createTransporter();
    await transporter.verify();
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      smtp: 'connected',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. Logging Strategy
```typescript
// Comprehensive logging
console.log('SMTP connection attempt:', {
  host: settings.smtpHost,
  port: settings.smtpPort,
  username: settings.username,
  // Never log password
});

console.log('Email sent successfully:', {
  messageId: result.messageId,
  to: validatedData.to,
  subject: validatedData.subject,
});
```

## Key Takeaways

1. **Port Configuration is Critical**: SMTP2GO port 2525 requires `secure: false` and `requireTLS: true`
2. **Test First**: Always verify SMTP connection before sending emails
3. **Store Everything**: Track both successful and failed email attempts
4. **Use Environment Variables**: Never hardcode credentials
5. **Implement Rate Limiting**: Prevent abuse and protect your API
6. **Handle Errors Gracefully**: Provide meaningful error messages
7. **Dynamic Configuration**: Store settings in database for flexibility

## Final Notes

The most common cause of SMTP2GO authentication failures is incorrect SSL/TLS configuration. Remember: for port 2525, always use `secure: false` and `requireTLS: true`. This single configuration issue causes 80% of setup problems.

Always test your SMTP connection separately before implementing email sending functionality. This will save you hours of debugging time.

---

*This guide is based on real implementation experience and covers the most common issues encountered when setting up SMTP2GO with Node.js applications.*