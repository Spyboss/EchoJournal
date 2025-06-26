# Firebase Deployment Guide

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Development

### Local Development
```bash
npm run dev
```

### With Firebase Emulators
```bash
# Terminal 1: Start Firebase emulators
npm run firebase:emulators

# Terminal 2: Start Next.js dev server
npm run dev
```

## Deployment

### Build and Deploy
```bash
npm run firebase:deploy
```

### Deploy Hosting Only
```bash
npm run build:firebase
```

## Troubleshooting

### Common Issues

1. **400 Error on Authentication**
   - Ensure Firebase project is properly configured
   - Check that the domain is authorized in Firebase Console
   - Verify API keys are correct

2. **CORS Issues**
   - Add your domain to Firebase Auth authorized domains
   - Check Firebase hosting configuration

3. **Build Errors**
   - Run `npm run typecheck` to check TypeScript errors
   - Run `npm run lint` to check linting issues

### Firebase Console Settings

1. **Authentication**
   - Enable Email/Password provider
   - Add authorized domains (your hosting domain)

2. **Hosting**
   - Ensure custom domain is properly configured
   - Check SSL certificate status

## Environment Variables

Make sure these are set in your `.env` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

For production, set these in your hosting environment or Firebase hosting environment variables.