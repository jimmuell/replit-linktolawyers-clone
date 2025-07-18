# Two-Domain Deployment Guide

## Overview
This guide explains how to deploy both English and Spanish versions of LinkToLawyers to separate domains.

## Architecture
- **English Version**: `linkto-lawyers.com` (client/ folder)
- **Spanish Version**: `linkto-abogados.com` (client-spanish/ folder)  
- **Shared Backend**: Both versions use the same PostgreSQL database and API endpoints

## Deployment Options

### Option 1: Two Separate Replit Projects (Recommended)

#### English Version Deployment
1. Create a new Replit project for English version
2. Copy all files EXCEPT `client-spanish/` folder
3. Use the main `package.json` and `vite.config.ts`
4. Deploy to `linkto-lawyers.com`

#### Spanish Version Deployment
1. Create a second Replit project for Spanish version
2. Copy all files EXCEPT `client/` folder
3. Rename `client-spanish/` to `client/`
4. Use `package-spanish.json` as `package.json`
5. Use `vite-spanish.config.ts` as `vite.config.ts`
6. Deploy to `linkto-abogados.com`

### Option 2: Single Project with Environment Variables

#### Setup
1. Add environment variables to control which version to serve:
   - `SITE_LANGUAGE=en` for English
   - `SITE_LANGUAGE=es` for Spanish

2. Modify server to serve appropriate client based on environment

### Option 3: Subdomain Approach
- English: `www.linkto-lawyers.com`
- Spanish: `es.linkto-lawyers.com`

## Configuration Files Created

### For Spanish Version:
- `client-spanish/package.json` - Dependencies for Spanish frontend
- `client-spanish/vite.config.ts` - Vite configuration
- `client-spanish/tailwind.config.js` - Tailwind CSS configuration
- `package-spanish.json` - Full stack Spanish version dependencies
- `vite-spanish.config.ts` - Spanish version Vite config

### Deployment Configs:
- `.replit-english` - English deployment configuration
- `.replit-spanish` - Spanish deployment configuration

## Database Configuration
Both versions share the same database and API endpoints:
- PostgreSQL database (configured in `DATABASE_URL`)
- All API routes in `server/routes.ts`
- Email templates support both languages

## DNS Configuration
After deployment, configure DNS:
1. Point `linkto-lawyers.com` to English version
2. Point `linkto-abogados.com` to Spanish version
3. Ensure SSL certificates are configured for both domains

## Testing
1. English version: Access deployed English site
2. Spanish version: Access deployed Spanish site
3. Test language toggle buttons work correctly
4. Verify forms submit to same backend API
5. Check email confirmations work in both languages

## Environment Variables Needed
Both deployments need:
- `DATABASE_URL` - PostgreSQL connection string
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `NODE_ENV=production`

## Language Toggle Implementation
- English site has "Español" button → redirects to `linkto-abogados.com`
- Spanish site has "English" button → redirects to `linkto-lawyers.com`