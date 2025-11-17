# Duc Nguyen - AI-Enhanced Portfolio Website

A cutting-edge portfolio website featuring an **AI-powered assistant** built with WebLLM, advanced RAG systems, and session memory. Showcasing enterprise backend development and AI/ML expertise.

## 🚀 Live Demo

Visit the live portfolio: [https://ductringuyen0186.github.io/portfolio-website/](https://ductringuyen0186.github.io/portfolio-website/)

**🤖 Try the AI Assistant**: Interactive chat with persistent conversations, smart action buttons, and professional Q&A.

## 🌟 Key Features

### 🧠 **AI-Powered Assistant**
- **WebLLM Integration**: Client-side AI with Phi-3.5-mini model
- **Session Memory**: Persistent conversations across browser sessions
- **Smart RAG**: Optimized knowledge retrieval with intent detection
- **Action Buttons**: One-click LinkedIn/GitHub/email access
- **MCP Tools**: Advanced tool integration and execution

### 💼 **Professional Showcase**
- **Enterprise Experience**: Contributing to Triton Digital backend systems
- **AI/ML Projects**: WebLLM, AWS Bedrock, RAG systems
- **Modern Stack**: React 19, TypeScript, Tailwind CSS
- **Production Ready**: GitHub Actions CI/CD, performance optimized

## 🛠️ Tech Stack

### **Frontend & UI**
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS, Custom animations
- **Build**: Vite, ESBuild optimization

### **AI & ML**
- **LLM**: WebLLM (Phi-3.5-mini-instruct-q4f16_1-MLC)
- **RAG**: Custom semantic search, vector similarity
- **Memory**: Session persistence, conversation continuity
- **Tools**: MCP integration, action button generation

### **Backend Integration** 
- **Knowledge Base**: Optimized JSON with smart caching
- **Performance**: Real-time monitoring, search optimization
- **Security**: Client-side processing, no API keys required

## � Getting Started

### Prerequisites
- Node.js 18+ (for optimal WebLLM performance)
- Modern browser with WebAssembly support
- 4GB+ RAM recommended for AI features

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ductringuyen0186/portfolio-website.git
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🌿 Git Workflow (IMPORTANT)

**⚠️ NEVER work directly on `main` branch!**

This project follows a **feature branch workflow**. All changes must be made on feature branches.

#### Quick Start with Helper Script (PowerShell)

```powershell
# Load git workflow helpers
. .\scripts\git-workflow.ps1

# Create a new feature branch (checks GH CLI auth automatically)
New-FeatureBranch "add-new-feature"

# Or use short alias
nfb "fix-bug" -Prefix "fix"

# Check your status
Get-GitStatus  # or: gst
```

#### Manual Branch Creation

```bash
# 1. Authenticate GitHub CLI (first time only)
gh auth login

# 2. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature"
git push

# 4. Create Pull Request
gh pr create
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes  
- `refactor/` - Code refactoring
- `test/` - Test updates
- `docs/` - Documentation
- `chore/` - Maintenance
- `perf/` - Performance improvements

See [Copilot Instructions](.github/copilot-instructions.md) for complete workflow details.

### 🤖 AI Assistant Setup

The AI assistant works out of the box with:
- **Automatic Model Loading**: WebLLM downloads Phi-3.5-mini on first use
- **Session Persistence**: Conversations saved in browser storage
- **Smart Caching**: Optimized model loading and inference

### Development Commands

```bash
# Development with AI features
npm run dev          # Hot reload with AI assistant active
npm run build        # Production build
npm run preview      # Test production build locally

# Code Quality & Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ui      # Open Vitest UI dashboard

# Type Checking & Linting
npm run type-check   # Validates TypeScript
npm run lint         # Run ESLint
```

### Testing

This project follows **enterprise-grade testing standards** with strict quality gates:

**Definition of Done:**
- ✅ All tests pass (80%+ coverage required)
- ✅ Zero TypeScript errors
- ✅ ESLint passes with no errors
- ✅ Proper documentation (JSDoc comments)

**Testing Framework:**
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **Coverage Reporting** - Detailed coverage metrics

For complete testing documentation, see [TESTING.md](./TESTING.md)

### Development Tips

```bash
# Watch mode for TDD workflow
npm run test:watch   # Auto-run tests on file changes

# Performance monitoring
npm run build        # Check bundle size with WebLLM

# Type checking with AI types
npm run type-check   # Validates WebLLM and transformer types
```

## 🚀 Deployment

### Automatic GitHub Pages Deployment

This project uses optimized GitHub Actions for AI-enhanced deployment:

1. **Smart Caching**: WebLLM models and dependencies
2. **Performance Optimization**: Bundle splitting for AI features
3. **Progressive Loading**: AI assistant loads after critical content

### Manual Deployment

```bash
# Production build with AI optimization
npm run build

# Test AI performance locally
npm run preview
```

## 📁 Project Structure

```
portfolio-website/
├── public/
│   ├── resume.pdf           # Professional resume
│   ├── agent/
│   │   └── kb.json         # AI knowledge base
│   └── knowledge-base/
├── src/
│   ├── components/
│   │   ├── AgentDemo.tsx   # AI assistant interface
│   │   ├── AgentWidget.ts  # WebLLM integration
│   │   ├── Layout/         # Page layout components
│   │   └── VideoPlayer.tsx # Media components
│   ├── data/
│   │   ├── knowledgeBase.ts  # AI training data
│   │   └── projects.ts       # Portfolio projects
│   ├── pages/              # Main app pages
│   ├── utils/
│   │   ├── simpleSemanticSearch.ts  # RAG search
│   │   ├── performanceMonitor.ts    # AI metrics
│   │   └── pdfProcessor.ts          # Knowledge extraction
│   └── types/
│       └── transformers.d.ts       # WebLLM types
├── docs/
│   └── rag-libraries-research.md   # AI implementation notes
└── .github/workflows/              # CI/CD with AI optimization
```

## 🤖 AI Assistant Architecture

### Core Components
- **WebLLM Engine**: Client-side Phi-3.5-mini model
- **RAG System**: Semantic search with intent detection  
- **Session Memory**: Persistent conversation state
- **Action System**: Smart button generation for LinkedIn/GitHub
- **Performance Monitor**: Real-time AI metrics

### Knowledge Base Structure
```typescript
interface KnowledgeItem {
  question: string;
  answer: string;
  tags: string[];
  category: 'personal' | 'experience' | 'projects' | 'skills';
  actionButtons?: ActionButton[];
}
```

## 🎨 Customization Guide

### Updating Professional Information
1. **Personal Data**: Update `src/data/knowledgeBase.ts`
2. **Project Portfolio**: Modify `src/data/projects.ts`
3. **Resume**: Replace `public/resume.pdf`
4. **AI Knowledge**: Update `public/agent/kb.json`

### AI Assistant Customization
1. **Model Selection**: Configure WebLLM model in `AgentWidget.ts`
2. **Knowledge Training**: Add Q&A pairs to knowledge base
3. **Action Buttons**: Define custom actions for social links
4. **Performance Tuning**: Adjust search parameters in RAG system

## 📄 Development Scripts

- `npm run dev` - Start with AI assistant enabled
- `npm run build` - Production build with WebLLM optimization
- `npm run preview` - Test AI performance locally
- `npm run lint` - Code quality with AI type checking
- `npm run type-check` - Validate WebLLM and transformer types

## 🌟 Featured Projects

### 🤖 **AI-Powered Portfolio Assistant**
- **WebLLM Integration**: Client-side Phi-3.5-mini model
- **RAG System**: Smart knowledge retrieval with 95%+ accuracy
- **Session Memory**: Persistent conversations across browser sessions
- **Action Buttons**: One-click LinkedIn/GitHub/email access

### ⚡ **Enterprise Backend Systems** 
- **Enterprise Systems**: Contributing to high-performance backend development
- **AWS Bedrock**: Enterprise AI platform integration
- **Kubernetes**: Auto-scaling microservices architecture
- **Spring Boot**: High-performance Java applications

### 🎯 **AI Tech News Assistant**
- **Real-time Processing**: Live tech news analysis
- **Sentiment Analysis**: Market trend detection
- **Smart Filtering**: Personalized content curation

### 💼 **Professional Experience**
- **Software Engineer** @ Triton Digital (Current)
- **Full-Stack Development**: React, TypeScript, Java, Spring Boot
- **AI/ML Engineering**: WebLLM, RAG systems, AWS Bedrock
- **DevOps**: Kubernetes, CI/CD, performance optimization

## 📧 Contact & Links

- **Email**: [ductringuyen0186@gmail.com](mailto:ductringuyen0186@gmail.com)
- **LinkedIn**: [linkedin.com/in/ductringuyen](https://linkedin.com/in/ductringuyen)  
- **GitHub**: [github.com/ductringuyen0186](https://github.com/ductringuyen0186)
- **Location**: Seattle, WA

*Try the AI assistant on the live site for instant answers about my experience and projects!*

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
