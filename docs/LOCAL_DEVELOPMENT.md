# Local Development Guide - Image Storage

This document explains how to run LinkToLawyers locally on your Mac while connecting to the Replit cloud database, with a focus on managing images across both environments.

## Overview

The application uses a **dual-mode storage system**:
- **Production (Replit)**: Images stored in Replit Object Storage (cloud)
- **Local Development (Mac)**: Images stored in `public/uploads/` folder

Both environments share the **same database**, which stores image URLs in a canonical format.

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         Shared Database                          │
│                                                                   │
│  Blog Post #8:  image_url = "/images/uploads/23a0ecfc-...jpeg"   │
│  Blog Post #9:  image_url = "/images/uploads/d40f4d4e-..."       │
│  Blog Post #12: image_url = "/images/uploads/02acadce-..."       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Production (Replit)    │    │   Local Dev (Mac)        │
│                          │    │                          │
│  Object Storage:         │    │  public/uploads/:        │
│  .private/uploads/       │    │  - 23a0ecfc-....jpeg     │
│  - 23a0ecfc-...          │    │  - d40f4d4e-....jpeg     │
│  - d40f4d4e-...          │    │  - 02acadce-....jpeg     │
│  - 02acadce-...          │    │                          │
│                          │    │                          │
│  Served via:             │    │  Served via:             │
│  /images/uploads/*       │    │  /uploads/*              │
│  (Express route)         │    │  (Express static)        │
└──────────────────────────┘    └──────────────────────────┘
```

### URL Transformation

The frontend `getImageUrl()` function (in `client/src/lib/imageUtils.ts`) automatically transforms URLs based on environment:

| Database URL | Production | Local Dev |
|-------------|------------|-----------|
| `/images/uploads/abc123` | `/images/uploads/abc123` | `/uploads/abc123.jpeg` |
| `/images/uploads/abc123.jpeg` | `/images/uploads/abc123.jpeg` | `/uploads/abc123.jpeg` |

**Key behavior**: For local development, `.jpeg` extension is automatically added if missing.

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd <project-folder>
npm install
```

### 2. Create Environment File

Create a `.env` file in the project root:

```env
# Database connection (copy from Replit Secrets)
DATABASE_URL=postgresql://user:password@host:port/database

# Local development settings
PORT=5001
NODE_ENV=development

# Optional: Force local storage mode even on Replit
# USE_LOCAL_STORAGE=true
```

### 3. Download Images from Replit

To display existing blog images locally:

1. Open Replit workspace
2. Go to **Tools** → **App Storage** (or Object Storage)
3. Navigate to the uploads folder
4. Download each image file
5. Save them to your local `public/uploads/` folder with the **exact same filenames**

### 4. Run Locally

```bash
npm run dev
```

Access at: `http://localhost:5001`

## Managing Images

### Current Blog Post Images

As of the last sync, these are the image files needed locally:

| Blog Post | Image Filename |
|-----------|----------------|
| #8 - Understanding Legal Fees | `23a0ecfc-7fd0-49ec-9bd1-6b04f8ac0e77.jpeg` |
| #9 - Top 5 Questions to Ask | `d40f4d4e-465e-4b17-a085-3b89f2fda683.jpeg` |
| #10 - Legal Matching Companies | `aa631092-0228-4d22-adae-a5e9ee8c1591.jpeg` |
| #11 - Avoid Immigration Scams | `340994aa-8bf5-4c98-9051-9ae67ec192f6.jpeg` |
| #12 - Why You Shouldn't Wait | `02acadce-459a-4e94-aaa3-97d54da6dcf3` |

**Note**: Some files may have `.jpeg` extension, some may not. Download them as-is from Object Storage, then add `.jpeg` extension locally if needed.

### Scenario: Creating a Blog Post Locally

When you create a blog post with an image **locally**:

1. Image saves to `public/uploads/new-uuid.jpeg`
2. Database stores URL: `/images/uploads/new-uuid.jpeg`
3. Works perfectly on your local Mac ✅
4. **Does NOT exist on Replit** ❌

**To sync to production:**
- Upload the same image file to Replit's App Storage
- Or: Re-upload through the blog editor on Replit

### Scenario: Creating a Blog Post on Replit

When you create a blog post with an image **on Replit**:

1. Image saves to Object Storage
2. Database stores URL: `/images/uploads/new-uuid`
3. Works perfectly on Replit ✅
4. **Does NOT exist locally** ❌

**To sync locally:**
- Download the new image from Replit's App Storage
- Save it to `public/uploads/new-uuid.jpeg`

### Finding Required Image Filenames

Run this SQL query to see all blog post images:

```sql
SELECT id, title, image_url 
FROM blog_posts 
WHERE image_url IS NOT NULL AND image_url != '' 
ORDER BY id;
```

## File Naming Conventions

### Object Storage (Replit)
- Files stored WITHOUT extension: `abc123-def456-...`
- Some files may have extension: `abc123-def456-....jpeg`

### Local Storage (Mac)
- Files should have `.jpeg` extension: `abc123-def456-....jpeg`
- The frontend code automatically adds `.jpeg` for local requests

## Troubleshooting

### Images not showing locally

1. **Check file exists**: Verify the file is in `public/uploads/`
2. **Check filename**: Must match database URL exactly (with `.jpeg` extension locally)
3. **Check server**: Make sure Express static middleware is serving `public/` folder
4. **Test direct access**: Try `http://localhost:5001/uploads/filename.jpeg` directly

### Images not showing on Replit

1. **Check Object Storage**: Verify file exists in App Storage
2. **Check database URL**: Make sure blog post has correct `image_url`
3. **Test direct access**: Try `https://your-app.replit.app/images/uploads/filename`

### Database shows wrong image URL

Update via SQL:
```sql
UPDATE blog_posts 
SET image_url = '/images/uploads/correct-filename' 
WHERE id = <post_id>;
```

## Code Files Reference

| File | Purpose |
|------|---------|
| `client/src/lib/imageUtils.ts` | URL transformation for local/production |
| `server/objectStorage.ts` | Object Storage service, local mode detection |
| `server/routes.ts` | Image serving routes (`/images/*`) |
| `server/index.ts` | Express static middleware for `public/` folder |

## Environment Detection

The system automatically detects the environment:

```typescript
// In server/objectStorage.ts
function isLocalStorageMode(): boolean {
  // Force local mode via env var
  if (process.env.USE_LOCAL_STORAGE === 'true') return true;
  // No REPL_ID means local development
  if (!process.env.REPL_ID) return true;
  return false;
}

// In client/src/lib/imageUtils.ts
function isLocalDevelopment(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}
```

## Summary

| Action | Production (Replit) | Local (Mac) |
|--------|---------------------|-------------|
| Upload image | → Object Storage | → `public/uploads/` |
| View image | `/images/uploads/*` route | `/uploads/*` static |
| Database URL | `/images/uploads/uuid` | Same (shared DB) |
| Sync required | Download to local | Upload to Object Storage |
