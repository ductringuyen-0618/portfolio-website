export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo?: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  category: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'AI-Powered Portfolio Assistant',
    description: 'Advanced AI agent with WebLLM, session memory, and smart RAG. Features persistent conversations, action buttons for LinkedIn/GitHub, and MCP tool integration. Built with React 19 and TypeScript.',
    technologies: ['WebLLM', 'React 19', 'TypeScript', 'RAG', 'Session Memory', 'MCP', 'Tailwind CSS'],
    github: 'https://github.com/ductringuyen-0618/portfolio-website',
    demo: 'https://ductringuyen-0618.github.io/portfolio-website/',
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 2,
    title: 'AI Tech News Assistant',
    description: 'RAG-powered news aggregator with FastAPI backend, LangChain processing, and Chroma vector database. Includes semantic search, automated summaries, and React dashboard.',
    technologies: ['Python', 'FastAPI', 'LangChain', 'Chroma', 'React', 'TypeScript', 'Prefect'],
    github: 'https://github.com/ductringuyen-0618/ai-tech-news-assistant',
    images: [
      'screenshots/ai-tech-news/digest.png',
      'screenshots/ai-tech-news/knowledge.png',
      'screenshots/ai-tech-news/research.png',
      'screenshots/ai-tech-news/ask-ai.png',
      'screenshots/ai-tech-news/settings.png',
    ],
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 3,
    title: 'Salon Hub Management System',
    description: 'Complete salon management solution with Spring Boot 3.x backend, PostgreSQL database, and React frontend. Features booking system, employee management, and queue optimization.',
    technologies: ['Spring Boot', 'PostgreSQL', 'React', 'TypeScript', 'Docker', 'Gradle', 'Testcontainers'],
    github: 'https://github.com/ductringuyen-0618/salon-hub-api',
    images: [
      'screenshots/salon-hub/home.png',
      'screenshots/salon-hub/booking.png',
      'screenshots/salon-hub/register.png',
      'screenshots/salon-hub/login.png',
      'screenshots/salon-hub/check-in.png',
      'screenshots/salon-hub/colors.png',
    ],
    featured: true,
    category: 'Full-Stack'
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
