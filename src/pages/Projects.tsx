import { useState, useMemo } from 'react';
import { projects } from '../data/projects';

import VideoPreview from '../components/VideoPreview';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const openVideoPlayer = (videoUrl: string, title: string) => {
    // For now, just log the demo URL - could open in new tab or show modal later
    console.log('Demo URL:', videoUrl, 'Title:', title);
    // window.open(videoUrl, '_blank');
  };

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'AI/ML', label: 'AI/ML' },
    { value: 'Full-Stack', label: 'Full-Stack' },
    { value: 'Enterprise', label: 'Enterprise' },
    { value: 'Backend', label: 'Backend' },
  ];

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero Section */}
      <section className="relative section-padding bg-gradient-to-br from-earth-50 via-earth-100/30 to-earth-200/30 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-earth-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-earth-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>

        <div className="container-custom text-center relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-earth-200 rounded-full shadow-sm mb-6">
              <span className="text-sm font-semibold text-earth-700">Portfolio Collection</span>
            </div>
            <h1 className="text-6xl font-bold text-earth-800 text-shadow-sm">My Projects</h1>
            <p className="text-xl text-earth-600 max-w-4xl mx-auto leading-relaxed">
              A collection of projects showcasing my expertise in{' '}
              <span className="font-semibold text-earth-600">AI/ML systems</span>,{' '}
              <span className="font-semibold text-earth-700">enterprise backend development</span>, and{' '}
              <span className="font-semibold text-green-600">production-grade applications</span>. 
              Featuring advanced <span className="font-semibold text-orange-600">WebLLM integration</span> and <span className="font-semibold text-red-600">RAG systems</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section-padding bg-white">
        <div className="container-custom space-y-12">
          {/* Filters */}
          <div className="card-elevated p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-earth-800 mb-2">Filter Projects</h3>
              <p className="text-earth-600">Find projects by technology, category, or search terms</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-3">Search</label>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-earth-600 font-medium">
                Showing <span className="font-bold text-earth-800">{filteredProjects.length}</span> of <span className="font-bold text-earth-800">{projects.length}</span> projects
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="btn-ghost text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className="card-elevated p-8 group hover:scale-105">
                  <div className="space-y-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-earth-800 group-hover:text-earth-600 transition-colors duration-300">{project.title}</h3>
                      <span className="tag tag-blue">
                        {project.category}
                      </span>
                    </div>

                    {/* Project Image Placeholder */}
                    {project.demo ? (
                      <VideoPreview
                        title={`${project.title} Demo`}
                        onClick={() => openVideoPlayer(project.demo!, project.title)}
                        className="w-full h-40"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-earth-100 to-earth-200 rounded-xl flex items-center justify-center group-hover:from-earth-200 group-hover:to-earth-300 transition-all duration-500">
                        <div className="text-earth-500 text-center">
                          <div className="w-12 h-12 bg-earth-300 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:bg-earth-400 transition-colors duration-500">
                            <span className="text-lg font-bold text-earth-600 group-hover:text-earth-700">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                          <p className="text-xs font-medium">Preview</p>
                        </div>
                      </div>
                    )}

                    <p className="text-earth-600 text-sm leading-relaxed line-clamp-3">{project.description}</p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="tag tag-gray"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="tag tag-gray">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="flex space-x-3 pt-4 border-t border-earth-100">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost text-sm group/link"
                        >
                          <span>View Code</span>
                        </a>
                      )}
                      {project.demo && (
                        <button
                          onClick={() => openVideoPlayer(project.demo!, project.title)}
                          className="btn-ghost text-sm group/link"
                        >
                          <span>Video Demo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-earth-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold text-earth-800 mb-4">No Projects Found</h3>
                <p className="text-earth-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}

    </div>
  );
};

export default Projects;
