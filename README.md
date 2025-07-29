# 🌟 Echo Journal

> A modern, AI-powered daily journaling application built with Next.js, Firebase, and Google AI

![Echo Journal](https://img.shields.io/badge/Next.js-15.2.3-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📝 **Core Journaling**
- **Text & Voice Input**: Write or record your daily thoughts
- **Real-time Sync**: Your entries sync across all devices instantly
- **Chronological Display**: Clean, organized view of your journal history
- **Secure Authentication**: Email/password login with Firebase Auth

### 🤖 **AI-Powered Insights**
- **Sentiment Analysis**: AI analyzes the emotional tone of your entries
- **Weekly Reflections**: Get AI-generated summaries and writing prompts
- **Smart Summaries**: Understand patterns in your thoughts and feelings

### 🎨 **Modern Design**
- **Dark/Light Theme**: Toggle between themes for comfortable reading
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Minimalist UI**: Clean interface that focuses on your content
- **Smooth Animations**: Subtle transitions for a polished experience

### 🔧 **Technical Features**
- **Real-time Database**: Firestore for instant data synchronization
- **Voice Recording**: Built-in audio recording and playback
- **Entry Management**: Edit, delete, and organize your entries
- **Offline Support**: Continue writing even without internet

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase CLI** (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EchoJournal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The project includes a `.env` file with Firebase configuration. For production, you'll need to:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get a Google AI API key from [Google AI Studio](https://aistudio.google.com)
   - Update the `.env` file with your credentials

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Start Genkit with file watching

# Building
npm run build            # Build for production
npm run build:firebase   # Build and deploy to Firebase

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run full CI test suite

# Firebase
npm run firebase:emulators  # Start Firebase emulators
npm run firebase:deploy     # Deploy to Firebase
npm run firebase:serve      # Serve built app locally

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

### Project Structure

```
EchoJournal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── entries/       # Journal entry endpoints
│   │   │   ├── sentiment/     # Sentiment analysis
│   │   │   └── weekly-reflection/  # Weekly summaries
│   │   ├── weekly-reflection/ # Weekly reflection page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Home page
│   ├── ai/                    # AI integration
│   │   ├── flows/            # AI workflows
│   │   └── ai-instance.ts    # AI configuration
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── AuthForm.tsx     # Authentication forms
│   │   └── theme-*.tsx      # Theme components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities and services
│       ├── firebase.ts      # Firebase client config
│       ├── firestore.ts     # Firestore operations
│       └── journalService.ts # Journal API service
├── functions/               # Firebase Cloud Functions
├── public/                  # Static assets
├── docs/                    # Documentation
└── firebase.json           # Firebase configuration
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication with Email/Password
4. Create a Firestore database

### 2. Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journal_entries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Deploy to Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
npm run firebase:deploy
```

## 🤖 AI Features

### Sentiment Analysis
Every journal entry is automatically analyzed for emotional content using Google's Gemini AI:
- **Sentiment Detection**: Positive, negative, or neutral
- **Emotion Summary**: Brief description of the emotional tone
- **Real-time Processing**: Analysis happens as you write

### Weekly Reflections
Get AI-generated insights about your week:
- **Pattern Recognition**: Identify recurring themes
- **Writing Prompts**: Personalized suggestions for deeper reflection
- **Mood Trends**: Track emotional patterns over time

## 🎨 Customization

### Themes
The app supports both light and dark themes with a smooth toggle transition. Themes are built with:
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Dynamic theme switching
- **System Preference**: Automatically detects user's system theme

### Color Palette
- **Primary**: Calm blue (#4682B4) for relaxation
- **Secondary**: Light gray (#D3D3D3) for backgrounds
- **Accent**: Teal (#008080) for interactive elements
- **Text**: High contrast for readability

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run CI tests (includes type checking and linting)
npm run test:ci
```

### Test Coverage
- **API Routes**: All endpoints tested
- **Firestore Operations**: Database interactions
- **Component Testing**: UI component behavior
- **Integration Tests**: End-to-end workflows

## 📱 Mobile Support

- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Intuitive mobile interactions
- **Voice Recording**: Native audio recording on mobile
- **Offline Mode**: Continue journaling without internet

## 🔒 Security

- **Firebase Authentication**: Secure user management
- **Firestore Rules**: Data access control
- **Environment Variables**: Secure API key management
- **HTTPS Only**: Encrypted data transmission

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build:firebase
```

### Vercel
```bash
npm run build
# Deploy to Vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow the existing TypeScript and React patterns
- **Testing**: Add tests for new features
- **Documentation**: Update README for significant changes
- **Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Firebase Team**: For the backend infrastructure
- **Google AI**: For the sentiment analysis capabilities
- **Radix UI**: For the beautiful component primitives
- **Tailwind CSS**: For the utility-first styling approach

## 📞 Support

If you have any questions or need help:

- **Documentation**: Check the `/docs` folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

<div align="center">
  <p><strong>Made with ❤️ for better journaling</strong></p>
  <p>Start your mindful writing journey today!</p>
</div>
