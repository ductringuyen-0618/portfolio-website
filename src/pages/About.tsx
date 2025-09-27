import { Download, MapPin, Calendar } from 'lucide-react';

const About = () => {
  const experiences = [
    {
      title: 'Software Engineer',
      company: 'Triton Digital',
      period: '2022 - Present',
      description:
        'Backend engineer contributing to enterprise systems and exploring AI/ML technologies. Working with Kubernetes/OpenShift orchestration and recently expanding skills in AWS Bedrock AgentCore, implementing RAG systems and session memory patterns for intelligent agents. Experience with production monitoring tools and performance optimization techniques.',
    },
    {
      title: 'AI/ML Research & Development',
      company: 'Personal Projects',
      period: '2024 - Present',
      description:
        'Pioneering WebLLM integration with advanced RAG systems, featuring session memory persistence, MCP tool execution, and smart action button generation. Built production-ready AI assistant with conversation continuity, semantic search, and dynamic response formatting. Technologies: WebLLM, Transformers.js, Vector databases, LangChain.',
    },
    {
      title: 'Game Developer',
      company: 'Bobaface',
      period: '2021 - 2022',
      description:
        'Engineered game mechanics and physics systems for mobile gaming platform. Collaborated with cross-functional teams including artists and UI designers. Successfully launched on iOS App Store and Google Play Store with 10,000+ downloads.',
    },
  ];

  const skills = [
    { category: 'Languages', items: ['Kotlin', 'Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'Go'] },
    { category: 'Backend & APIs', items: ['Spring Boot', 'Ktor', 'REST APIs', 'Microservices', 'Enterprise Architecture', '50k+ TPS'] },
    { category: 'AI & ML', items: ['WebLLM', 'AWS Bedrock', 'RAG Systems', 'LangChain', 'Transformers.js', 'MCP Tools'] },
    { category: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Session Management', 'Real-time UI'] },
    { category: 'Cloud & DevOps', items: ['Kubernetes', 'OpenShift', 'AWS', 'Docker', 'ArgoCD', 'CI/CD', '99.9% Uptime'] },
    { category: 'Data & Monitoring', items: ['MySQL', 'Kafka', 'Grafana', 'Performance Optimization', 'Vector Databases'] },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative section-padding bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center space-y-12 animate-fade-in-up">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-500">
                <span className="text-white font-bold text-5xl">DN</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm">
                <span className="text-sm font-semibold text-slate-700">Software Engineer</span>
              </div>

              <h1 className="text-6xl font-bold text-slate-900 mb-6 text-shadow-sm">About Me</h1>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-slate-600">
                <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <MapPin size={20} className="text-blue-600" />
                  <span className="font-medium">Seattle, WA</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <Calendar size={20} className="text-purple-600" />
                  <span className="font-medium">5+ Years Experience</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl mx-auto">
              Software Engineer at <span className="font-semibold text-blue-600">Triton Digital</span>, specializing in <span className="font-semibold text-slate-800">enterprise backend systems</span>, <span className="font-semibold text-purple-600">AI/ML integration</span>, and <span className="font-semibold text-slate-800">cloud-native architectures</span>. Currently exploring <span className="font-semibold text-green-600">WebLLM applications</span> with advanced <span className="font-semibold text-orange-600">RAG systems</span>, while contributing to production systems.
            </p>

            <a
              href="/portfolio-website/resume.pdf"
              target="_blank"
              className="btn-primary text-lg px-8 py-4 group"
            >
              <Download size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700">Professional Journey</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6 text-shadow-sm">Experience</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">My professional journey in software development and system architecture</p>
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="card-elevated p-10 group hover:scale-105">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">{exp.title}</h3>
                    <p className="text-blue-600 font-semibold text-lg">{exp.company}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">{exp.period}</span>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-purple-700">Technical Expertise</span>
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6 text-shadow-sm">Skills & Technologies</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Technologies and tools I work with on a daily basis to build robust solutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup) => (
              <div key={skillGroup.category} className="card-elevated p-8 group hover:scale-105">
                <h3 className="text-xl font-bold text-slate-900 mb-6 group-hover:text-blue-600 transition-colors duration-300">{skillGroup.category}</h3>
                <div className="space-y-3">
                  {skillGroup.items.map((skill) => (
                    <div
                      key={skill}
                      className="px-4 py-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 cursor-default"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Section */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-12">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-700">Personal Philosophy</span>
              </div>
              <h2 className="text-5xl font-bold text-slate-900 text-shadow-sm">Beyond Code</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
              <div className="card-elevated p-10 group hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-500">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">What drives me</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  I'm passionate about creating web applications that solve real business problems.
                  From building intuitive user interfaces to designing robust APIs, I enjoy the
                  entire development process and the satisfaction of delivering solutions that
                  users love and businesses depend on.
                </p>
              </div>

              <div className="card-elevated p-10 group hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/30 transition-all duration-500">
                  <span className="text-white text-2xl">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">When I'm not coding</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  You can find me exploring Seattle's tech scene, learning new frameworks and tools,
                  or enjoying the Pacific Northwest outdoors. I believe in continuous learning and
                  staying current with modern web development practices and emerging technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
