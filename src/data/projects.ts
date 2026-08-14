export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo?: string;
  liveUrl?: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  category: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'TechPulse AI - Agentic Tech News Desk',
    description: 'An agentic research workspace for tech news. Decomposes any question into sub-questions, dispatches subagents in parallel via deepagents, and streams a cited report back over Server-Sent Events. Two-mode UI: Atelier (calm reading) and Mission Control (dense scan). Daily ingestion from 5 RSS sources, sentence-transformer embeddings + SQLite vector search, knowledge-graph entity extraction, and Groq-hosted Llama 3.3 70B inference. Live at techpulse-ai-phi.vercel.app.',
    technologies: ['Python', 'FastAPI', 'Groq', 'deepagents', 'sentence-transformers', 'SQLite', 'React 19', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Playwright', 'Fly.io', 'Vercel'],
    github: 'https://github.com/ductringuyen-0618/ai-tech-news-assistant',
    liveUrl: 'https://techpulse-ai-phi.vercel.app',
    images: [
      'screenshots/ai-tech-news/home-atelier.png',
      'screenshots/ai-tech-news/feed-atelier.png',
      'screenshots/ai-tech-news/feed-mission.png',
      'screenshots/ai-tech-news/research.png',
      'screenshots/ai-tech-news/digest.png',
      'screenshots/ai-tech-news/knowledge.png',
    ],
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 2,
    title: 'Salon Hub — Multi-Tenant SaaS Platform',
    description: 'Configurable salon storefront-as-a-service: anyone can sign up at /signup and spin up their own fully isolated salon with branding, hours, services, staff, online booking, walk-in check-in, and a live wait-time queue. Spring Boot 3 monorepo with Hibernate row-level multi-tenancy (one DB, tenant_id on every row, JWT-bound tenant scoping), Supabase Auth (ES256 JWT verification), and React 18 + Vite + Tailwind frontend. Deployed on Fly.io (API) and Vercel (web).',
    technologies: ['Spring Boot 3', 'PostgreSQL', 'Hibernate Filters', 'Flyway', 'Supabase Auth', 'React 18', 'TypeScript', 'Vite', 'Tailwind', 'shadcn/ui', 'Fly.io', 'Vercel', 'Docker', 'Gradle', 'Testcontainers'],
    github: 'https://github.com/ductringuyen-0618/salon-hub',
    liveUrl: 'https://salon-hub-black.vercel.app',
    images: [
      'screenshots/salon-hub/home.png',
      'screenshots/salon-hub/signup.png',
      'screenshots/salon-hub/booking.png',
      'screenshots/salon-hub/check-in.png',
      'screenshots/salon-hub/admin-dashboard.png',
      'screenshots/salon-hub/admin-settings.png',
      'screenshots/salon-hub/admin-services.png',
    ],
    featured: true,
    category: 'Full-Stack'
  },
  {
    id: 3,
    title: 'AI-Powered Portfolio Assistant',
    description: 'In-browser AI chat agent built for this portfolio: runs an LLM client-side via WebLLM, retrieves answers from a RAG pipeline over my resume/project data, persists conversations with session memory, and exposes LinkedIn/GitHub action buttons via MCP tool calls. Built with React 19 and TypeScript; currently disabled on the live site pending a performance pass, but fully implemented in the repo.',
    technologies: ['WebLLM', 'React 19', 'TypeScript', 'RAG', 'Session Memory', 'MCP', 'Tailwind CSS'],
    github: 'https://github.com/ductringuyen-0618/portfolio-website',
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 4,
    title: 'AWS Bedrock Agent Integration',
    description: 'AI agent deployment on AWS Bedrock AgentCore with session memory patterns, S3-backed knowledge bases, and MCP tool execution. CloudWatch logging and environment configuration.',
    technologies: ['AWS Bedrock', 'AgentCore', 'S3', 'CloudWatch', 'MCP', 'OpenAPI', 'LangGraph'],
    github: '#', // Private/Enterprise  
    featured: false,
    category: 'AI/ML'
  }
];

export function getFeaturedProjects() {
  return projects.filter(p => p.featured);
}
