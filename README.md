# 🌟 Echo Journal

> A modern, AI-powered daily journaling application built with Next.js, Supabase, and Google AI

![Echo Journal](https://img.shields.io/badge/Next.js-15.2.3-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📝 **Core Journaling**
- **Text & Voice Input**: Write or record your daily thoughts
- **Real-time Sync**: Your entries sync across all devices instantly
- **Chronological Display**: Clean, organized view of your journal history
- **Secure Authentication**: Email/password login with Supabase Auth

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
- **Real-time Database**: Supabase PostgreSQL for instant data synchronization
- **Voice Recording**: Built-in audio recording and playback
- **Entry Management**: Edit, delete, and organize your entries
- **Offline Support**: Continue writing even without internet

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase CLI** (for database management)

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
   
   The project includes a `.env` file with Supabase configuration. For production, you'll need to:
   - Create a Supabase project at [Supabase Console](https://supabase.com/dashboard)
   - Enable Authentication (Email/Password)
   - Set up your PostgreSQL database
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
npm run build            # Build for production (static export)

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run full CI test suite

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

### Project Structure

```
EchoJournal/
├── src/
│   ├── app/                    # Next.js App Router
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
│       ├── supabase.ts      # Supabase client config
│       ├── journalService.ts # Journal API service
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
├── docs/                    # Documentation
└── wrangler.toml           # Cloudflare Pages configuration
```

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Create a new project
3. Enable Authentication with Email/Password
4. Set up your PostgreSQL database

### 2. Configure Database Schema
```sql
-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own entries
CREATE POLICY "Users can only access their own entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Deploy to Cloudflare Pages
```bash
# Build the static site
npm run build

# The built files will be in the 'out' directory
# Upload to Cloudflare Pages or connect your GitHub repository
# for automatic deployments
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

- **Supabase Authentication**: Secure user management
- **Row Level Security**: Database access control
- **Environment Variables**: Secure API key management
- **HTTPS Only**: Encrypted data transmission

## 🚀 Deployment

### Cloudflare Pages
```bash
npm run build
# Upload the 'out' directory to Cloudflare Pages
# or connect your GitHub repository for automatic deployments
```

### Vercel
```bash
npm run build
# Deploy to Vercel
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
- **Supabase Team**: For the backend infrastructure and database
- **Cloudflare**: For the fast and reliable hosting platform
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
