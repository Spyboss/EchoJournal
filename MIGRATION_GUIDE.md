# 🚀 Migration Guide: Firebase → Cloudflare Pages + Workers + Supabase

This guide will help you migrate your Echo Journal app from Firebase to Cloudflare Pages + Workers + Supabase.

## 📋 Prerequisites

✅ Supabase project created  
✅ Cloudflare account  
✅ GitHub repository  

## 🔧 Step 1: Cloudflare Setup

### 1.1 Connect GitHub Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your GitHub repository
6. Configure build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)

### 1.2 Environment Variables in Cloudflare

Add these environment variables in Cloudflare Pages settings:

```
NODE_VERSION=18
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

## 🗄️ Step 2: Supabase Database Setup

### 2.1 Access Your EchoJournal Project

**Project Details:**
- **Project Name**: echojournal
- **Project ID**: xnypnxywqrgdpdwrzqfp
- **Database URL**: https://db.xnypnxywqrgdpdwrzqfp.supabase.co
- **Dashboard URL**: https://supabase.com/dashboard/project/xnypnxywqrgdpdwrzqfp

### 2.2 Create Tables

**IMPORTANT**: You need to manually execute these SQL commands in the Supabase SQL Editor:

1. Go to [EchoJournal Supabase Dashboard](https://supabase.com/dashboard/project/xnypnxywqrgdpdwrzqfp)
2. Navigate to **SQL Editor** in the sidebar
3. Copy and paste the following SQL commands:
4. Click **Run** to execute

**SQL Commands to Execute:**

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  sentiment_score DECIMAL,
  sentiment_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

## 📦 Step 3: Install Supabase Dependencies

✅ **COMPLETED** - Supabase client installed and Firebase dependencies can be removed later.

## 🔄 Step 4: Code Migration

✅ **COMPLETED** - All major components have been migrated:

- ✅ Next.js config updated for Cloudflare Pages
- ✅ Supabase client created (`src/lib/supabase.ts`)
- ✅ AuthContext migrated to Supabase Auth
- ✅ JournalService updated to use Supabase
- ✅ SignIn/SignUp components updated
- ✅ Navigation component updated
- ✅ Environment variables configured

## 🚀 Step 5: Supabase Credentials ✅ CONFIGURED

**Status**: ✅ **ALREADY CONFIGURED** - Your `.env` file is correctly set up with EchoJournal project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xnypnxywqrgdpdwrzqfp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueXBueHl3cXJnZHBkd3J6cWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzQ5MTAsImV4cCI6MjA2OTkxMDkxMH0.xuRiPRZVUD5cAWYi-nzbDWHFnNSZQ4dLgQXlVJ1tkrA
```

**No action needed** - proceed to deployment step.

## 🔧 Step 6: Environment Variables Status

✅ **COMPLETED** - All environment variables are properly configured.

## 🌐 Step 7: Deploy to Cloudflare Pages

### Option A: Connect via Cloudflare Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to **Pages** → **Create a project**
4. Connect to Git and select your repository
5. Use these build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)
   - **Node.js version**: `18`

6. Add environment variables:
   ```
   NODE_VERSION=18
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   ```

### Option B: Using Wrangler CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy out
```

## 🧪 Step 8: Test the Migration

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   - Test user registration
   - Test user login
   - Test creating journal entries
   - Test viewing journal entries

2. **Production Testing**:
   - Visit your Cloudflare Pages URL
   - Test all functionality
   - Check browser console for errors

## 🔧 Step 9: Custom Domain (Optional)

1. In Cloudflare Pages dashboard
2. Go to your project → **Custom domains**
3. Add your domain
4. Update DNS records as instructed

## 🧹 Step 10: Cleanup (After Successful Migration)

### Critical: Remove API Routes and Functions

**IMPORTANT**: For static export to work on Cloudflare Pages, you MUST remove:

1. **API Routes Directory** (causes build failures):
   ```bash
   Remove-Item -Recurse -Force "src\app\api"
   ```

2. **Functions Directory** (causes Wrangler errors):
   ```bash
   Remove-Item -Recurse -Force "functions"
   ```

### Optional: Remove Firebase Dependencies

3. Remove Firebase dependencies:
   ```bash
   npm uninstall firebase @tanstack-query-firebase/react
   ```

4. Delete Firebase files:
   - `src/lib/firebase.ts`
   - `src/lib/firebase-admin.ts`
   - `src/lib/firestore.ts`
   - `src/lib/firestore-admin.ts`
   - `.firebaserc`
   - `firebase.json`
   - `firestore.rules`
   - `storage.rules`

5. Remove Firebase environment variables from `.env`

## 🎉 Migration Complete!

**Your app is now running on:**
- ✅ **Frontend**: Cloudflare Pages (with global CDN)
- ✅ **Backend**: Supabase (PostgreSQL + Auth)
- ✅ **Domain**: Custom domain with SSL
- ✅ **Performance**: Edge-optimized delivery

## 🔧 Troubleshooting Common Deployment Issues

### Build Shows API Routes (ƒ Dynamic)
**Problem**: Build output shows `ƒ /api/entries`, `ƒ /api/sentiment`, etc.
**Solution**: Remove the entire `src/app/api` directory - API routes are incompatible with static export.

### "No routes found when building Functions directory"
**Problem**: Wrangler error about `/functions` directory.
**Solution**: Remove the `functions` directory - it's for Firebase Cloud Functions, not needed for static export.

### "Output directory 'out' not found"
**Problem**: Cloudflare can't find the build output.
**Solution**: Ensure `next.config.ts` has `output: 'export'` and `distDir: 'out'`, then run `npm run build`.

### Build Success Indicators
✅ Build output shows only `○ (Static)` routes
✅ No `ƒ (Dynamic)` routes in build output
✅ `out/` directory contains `.html` files
✅ No API routes or functions directories

## 📝 Notes

- **Sentiment Analysis**: Currently disabled for static export. You can re-enable it by creating a separate API service.
- **Real-time Features**: Supabase provides real-time subscriptions if needed.
- **Scaling**: Both Cloudflare and Supabase scale automatically.
- **Cost**: Free tier should handle most personal projects.

---

## ⚠️ NEXT STEPS REQUIRED

### 🔴 CRITICAL: Database Setup Required

**ACTION NEEDED**: You must manually execute the SQL commands in Step 2.2 to create the database tables:

1. ➡️ Go to [EchoJournal Supabase Dashboard](https://supabase.com/dashboard/project/xnypnxywqrgdpdwrzqfp)
2. ➡️ Navigate to **SQL Editor**
3. ➡️ Copy and paste the SQL commands from Step 2.2
4. ➡️ Click **Run** to execute

**Without this step, the app will not function properly.**

---

**Status**: 🎯 **READY FOR DEPLOYMENT** (after database setup)