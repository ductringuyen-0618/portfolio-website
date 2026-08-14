import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Database, Cloud, Github } from 'lucide-react';
import { getFeaturedProjects } from '../data/projects';
import type { Project } from '../data/projects';

import VideoPreview from '../components/VideoPreview';
import ImageLightbox from '../components/ImageLightbox';

const Home = () => {
  const featuredProjects = getFeaturedProjects();
  const [lightbox, setLightbox] = useState<{ project: Project; index: number } | null>(null);
  const openVideoPlayer = (videoUrl: string, title: string) => {
    // For now, just log the demo URL - could open in new tab or show modal later
    console.log('Demo URL:', videoUrl, 'Title:', title);
    // window.open(videoUrl, '_blank');
  };

  const projectImages = (p: Project): string[] => {
    if (p.images && p.images.length > 0) return p.images;
    if (p.image) return [p.image];
    return [];
  };

  const skills = [
    { name: 'Backend & AI Systems', icon: Code, description: 'Spring Boot, Kotlin, AWS Bedrock, WebLLM, RAG Systems' },
    { name: 'Cloud & DevOps', icon: Cloud, description: 'Kubernetes, OpenShift, AWS, Docker, CI/CD, 99.9% uptime' },
    { name: 'Data & Performance', icon: Database, description: 'MySQL, Kafka, Grafana, 50k+ daily transactions' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Main Content Area - Full Width */}
      <div className="min-h-screen">
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-earth-50 via-earth-100/30 to-earth-200/30"></div>
              <div className="absolute top-20 left-10 w-72 h-72 bg-earth-300/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-earth-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

              <div className="container-custom relative z-10">
                <div className="text-center space-y-12 animate-fade-in-up">
                  <div className="space-y-8">
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-earth-200 rounded-full shadow-sm">
                      <div className="w-2 h-2 bg-spark-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm font-medium text-earth-700">Software Engineer at Triton Digital</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl xl:text-8xl font-bold text-earth-800 mb-8 text-shadow-sm">
                      Hi, I'm{' '}
                      <span className="text-gradient">
                        Duc Nguyen
                      </span>
                    </h1>

                    <p className="text-lg md:text-xl xl:text-2xl text-earth-600 max-w-3xl mx-auto leading-relaxed font-light">
                      Software Engineer based in <span className="font-semibold text-earth-800">Seattle, WA</span>, specializing in <span className="font-semibold text-earth-800">backend systems</span>, <span className="font-semibold text-earth-800">AI integration</span>, and <span className="font-semibold text-earth-800">cloud-native architectures</span>.<br className="hidden md:block" />
                      Currently contributing to production systems at <span className="font-semibold text-earth-600">Triton Digital</span> and exploring <span className="font-semibold text-earth-500">AI/ML solutions</span> with AWS Bedrock and WebLLM.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                      to="/projects"
                      className="btn-primary text-lg px-8 py-4 group"
                    >
                      <span>View My Work</span>
                      <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link
                      to="/about"
                      className="btn-secondary text-lg px-8 py-4"
                    >
                      <span>About Me</span>
                    </Link>
                  </div> 

                  {/* AI Agent Highlight - Hidden while feature is disabled
                  <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl p-8 max-w-4xl mx-auto mt-16 shadow-xl">
                    <div className="text-center space-y-6">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                        <span className="text-sm font-semibold mr-2">🤖 NEW: AI-Powered Assistant</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">Interactive AI Agent with Advanced RAG</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Built with <span className="font-semibold text-blue-600">WebLLM</span>, <span className="font-semibold text-purple-600">session memory</span>, and <span className="font-semibold text-green-600">MCP integration</span>. 
                        Features smart knowledge retrieval, action buttons, and persistent conversations.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">WebLLM</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Session Memory</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">MCP Tools</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Smart RAG</span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Action Buttons</span>
                      </div>
                    </div>
                  </div>
                  */}

                  {/* Call to Action - Hidden while AI feature is disabled
                  <div className="xl:hidden pt-8">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg">
                      <span className="text-sm font-medium mr-2">💬 Try the AI Assistant below!</span>
                      <ArrowRight size={16} className="animate-bounce" />
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </section>

      {/* Skills Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-earth-100 border border-earth-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-earth-700">Core Expertise</span>
            </div>
            <h2 className="text-5xl font-bold text-earth-800 mb-6 text-shadow-sm">What I Do</h2>
            <p className="text-xl text-earth-600 max-w-3xl mx-auto leading-relaxed">
              I specialize in building robust backend systems and distributed architectures
              that scale with your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  className="card-elevated p-10 text-center group hover:scale-105"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-earth-400 to-earth-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-earth-500/25 group-hover:shadow-xl group-hover:shadow-earth-500/30 transition-all duration-500">
                    <Icon size={36} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-earth-800 mb-4 group-hover:text-earth-600 transition-colors duration-300">{skill.name}</h3>
                  <p className="text-earth-600 leading-relaxed font-medium">{skill.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section-padding bg-gradient-to-br from-earth-50 to-earth-100/30">
        <div className="container-custom">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-earth-100 border border-earth-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-earth-700">Portfolio Highlights</span>
            </div>
            <h2 className="text-5xl font-bold text-earth-800 mb-6 text-shadow-sm">Featured Projects</h2>
            <p className="text-xl text-earth-600 max-w-3xl mx-auto leading-relaxed">
              Here are some of my recent projects that showcase my skills and experience
              in building scalable, production-ready applications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="card-elevated p-8 group hover:scale-105"
              >
                <div className="space-y-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-bold text-earth-800 group-hover:text-earth-600 transition-colors duration-300">{project.title}</h3>
                    <span className="tag tag-blue">
                      {project.category}
                    </span>
                  </div>

                  {/* Project Image / Preview */}
                  {projectImages(project).length > 0 ? (
                    (() => {
                      const imgs = projectImages(project);
                      return (
                        <button
                          type="button"
                          onClick={() => setLightbox({ project, index: 0 })}
                          aria-label={`Open ${project.title} screenshots${imgs.length > 1 ? ` (${imgs.length} images)` : ''}`}
                          className="relative block w-full h-48 rounded-xl overflow-hidden border border-earth-100 group/img cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-earth-400"
                        >
                          <img
                            src={`${import.meta.env.BASE_URL}${imgs[0]}`}
                            alt={`${project.title} preview`}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <span className="opacity-0 group-hover/img:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">
                              {imgs.length > 1 ? `View ${imgs.length} screenshots` : 'View screenshot'}
                            </span>
                          </div>
                          {imgs.length > 1 && (
                            <span className="absolute top-2 right-2 text-xs font-semibold bg-black/70 text-white px-2 py-1 rounded-full">
                              {imgs.length}
                            </span>
                          )}
                        </button>
                      );
                    })()
                  ) : project.demo ? (
                    <VideoPreview
                      title={`${project.title} Demo`}
                      onClick={() => openVideoPlayer(project.demo!, project.title)}
                      className="w-full h-48"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-earth-100 to-earth-200 rounded-xl flex items-center justify-center group-hover:from-earth-200 group-hover:to-earth-300 transition-all duration-500">
                      <div className="text-earth-500 text-center">
                        <div className="w-16 h-16 bg-earth-300 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-earth-400 transition-colors duration-500">
                          <span className="text-2xl font-bold text-earth-600 group-hover:text-earth-700">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium">Project Preview</p>
                      </div>
                    </div>
                  )}

                  <p className="text-earth-600 leading-relaxed">{project.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="tag tag-gray"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="tag tag-gray">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action Links */}
                  <div className="flex space-x-4 pt-4 border-t border-earth-100">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost group/link"
                    >
                      <Github size={18} className="group-hover/link:scale-110 transition-transform duration-300" />
                      <span>Code</span>
                    </a>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost group/link text-spark-600 hover:text-spark-600 hover:bg-spark-500/10"
                      >
                        <span>Live Site →</span>
                      </a>
                    )}
                    {project.demo && (
                      <button
                        onClick={() => openVideoPlayer(project.demo!, project.title)}
                        className="btn-ghost group/link"
                      >
                        <span>Video Demo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/projects"
              className="btn-primary text-lg px-8 py-4 group"
            >
              <span>View All Projects</span>
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

        </div>
      </div>

      {/* Image Lightbox */}
      {lightbox && (
        <ImageLightbox
          images={projectImages(lightbox.project)}
          initialIndex={lightbox.index}
          title={lightbox.project.title}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};

export default Home;
