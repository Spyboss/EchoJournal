# Cloudflare Pages Deployment Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Cloudflare account** (free tier available)
4. **Supabase project** for database and authentication

## Development

### Local Development
```bash
npm run dev
```

### Environment Setup
Ensure your `.env` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

## Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Cloudflare Pages"
   git push origin master
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
     - **Root directory**: `/` (leave empty)

3. **Set Environment Variables**
   In Cloudflare Pages settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_AI_API_KEY`

### Method 2: Manual Upload

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload the `out` directory**
   - Go to Cloudflare Pages
   - Create a new project
   - Upload the `out` folder

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Run `npm run build` locally first
   - Check TypeScript errors: `npm run typecheck`
   - Verify all environment variables are set

2. **Authentication Issues**
   - Ensure Supabase project is properly configured
   - Add your Cloudflare Pages domain to Supabase Auth settings
   - Verify API keys are correct

3. **Static Export Issues**
   - Ensure `next.config.ts` has `output: 'export'`
   - Check for dynamic routes that need static generation

### Cloudflare Pages Settings

1. **Custom Domain**
   - Add your custom domain in Pages settings
   - Update DNS records as instructed

2. **Environment Variables**
   - Set in Pages > Settings > Environment variables
   - Use production values for live deployment

## Environment Variables

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

## Performance Optimization

- **Static Generation**: All pages are statically generated
- **CDN**: Cloudflare's global CDN for fast loading
- **Caching**: Automatic caching of static assets
- **Compression**: Built-in Gzip and Brotli compression

## Security

- **HTTPS**: Automatic SSL/TLS certificates
- **Environment Variables**: Secure storage of API keys
- **Supabase RLS**: Row Level Security for database access
- **CSP**: Content Security Policy headers (configure in Cloudflare)