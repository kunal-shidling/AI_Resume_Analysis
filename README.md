# AI Resume Analyzer

A modern, AI-powered resume analysis application that provides ATS scoring and detailed feedback to help job seekers improve their resumes. Built with React Router, Puter.js for cloud storage, and supports multiple AI providers.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🤖 **Multiple AI Providers**: OpenAI GPT-4, Anthropic Claude, or Google Gemini
- 📊 **Comprehensive Analysis**: ATS score, tone & style, content, structure, and skills evaluation
- 📄 **PDF Processing**: Automatic OCR text extraction from resume PDFs
- ☁️ **Cloud Storage**: Secure file storage with Puter.js
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎯 **Smart Fallback**: Built-in analysis when AI is unavailable
- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling

## Prerequisites

- Node.js 18+ 
- npm/pnpm/yarn
- An API key from one of the supported AI providers:
  - [OpenAI](https://platform.openai.com/api-keys) (Recommended: GPT-4o-mini)
  - [Anthropic](https://console.anthropic.com/) (Claude 3.5 Sonnet)
  - [Google AI Studio](https://makersuite.google.com/app/apikey) (Gemini 1.5 Flash)

## Getting Started

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure your AI API key:

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your API key:

```bash
# For OpenAI (recommended - most accurate)
VITE_OPENAI_API_KEY=sk-your-actual-key-here

# OR for Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# OR for Google Gemini
VITE_GOOGLE_API_KEY=your-actual-key-here
```

**Important**: Only one API key is needed. The app will automatically use the first configured provider.

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## How It Works

1. **Upload**: Users upload their resume PDF along with job details (company name, job title, description)
2. **OCR Processing**: PDF is converted to an image and text is extracted using OCR
3. **AI Analysis**: Resume text is analyzed by your chosen AI provider with detailed prompts
4. **Scoring**: Receives scores (0-100) in 5 categories:
   - ATS Compatibility
   - Tone and Style
   - Content Quality
   - Structure and Organization
   - Skills Presentation
5. **Feedback**: Detailed tips for improvement in each category
6. **Storage**: All resumes and analysis stored in Puter cloud for later review
7. **Dashboard**: View all analyzed resumes on the home page with ATS scores

## AI Provider Comparison

| Provider | Model | Cost | Speed | Accuracy |
|----------|-------|------|-------|----------|
| OpenAI | GPT-4o-mini | $ | Fast | Excellent |
| Anthropic | Claude 3.5 Sonnet | $$ | Fast | Excellent |
| Google | Gemini 1.5 Flash | Free tier | Very Fast | Good |

**Recommendation**: Start with OpenAI's GPT-4o-mini for the best balance of cost and accuracy.

## Project Structure

```
app/
├── components/       # Reusable React components
│   ├── ResumeCard.tsx    # Resume display card with ATS score
│   ├── ScoreCircle.tsx   # Overall score visualization
│   └── ScoreBadge.tsx    # ATS score badge
├── lib/
│   ├── aiAnalyzer.ts     # External AI integration
│   ├── putter.tsx        # Puter.js store for cloud storage
│   ├── pdf2img.tsx       # PDF conversion utilities
│   └── utils.ts          # Helper functions
├── routes/
│   ├── home.tsx          # Dashboard showing all resumes
│   ├── upload.tsx        # Resume upload and analysis
│   ├── resume.tsx        # Detailed analysis view
│   └── auth.tsx          # Puter authentication
└── constants/
    └── types/
        └── index.d.ts    # TypeScript definitions
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the browser:

```bash
VITE_OPENAI_API_KEY=        # OpenAI API key
VITE_ANTHROPIC_API_KEY=     # Anthropic Claude API key  
VITE_GOOGLE_API_KEY=        # Google Gemini API key
```

## Troubleshooting

### "No AI API key configured" error

Make sure you've:
1. Created a `.env` file in the project root
2. Added your API key with the `VITE_` prefix
3. Restarted the development server

### AI analysis fails

The app will automatically fall back to built-in smart analysis if:
- No API key is configured
- API key is invalid
- API rate limit exceeded
- Network issues

### OCR extraction issues

If text extraction fails:
- Ensure PDF is text-based, not scanned images
- Check PDF file isn't corrupted
- Try re-uploading the file

## Building for Production

Create a production build:

```bash
npm run build
```

Make sure to set your environment variables in your deployment platform's settings.

## Deployment

### Environment Variables in Production

When deploying, ensure you set the appropriate environment variable:

**Vercel/Netlify/Railway:**
- Go to project settings → Environment Variables
- Add `VITE_OPENAI_API_KEY` (or your chosen provider)
- Rebuild and redeploy

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
