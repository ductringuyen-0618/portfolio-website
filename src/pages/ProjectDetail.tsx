import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Github } from 'lucide-react';
import { projects } from '../data/projects';
import type { Project } from '../data/projects';

import ImageLightbox from '../components/ImageLightbox';

const projectImages = (p: Project): string[] => {
  if (p.images && p.images.length > 0) return p.images;
  if (p.image) return [p.image];
  return [];
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const project = projects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div className="min-h-screen bg-earth-50 dark:bg-earth-950">
        <section className="section-padding">
          <div className="container-custom text-center space-y-6">
            <h1 className="text-3xl font-bold text-earth-800 dark:text-earth-50">Project Not Found</h1>
            <p className="text-earth-600 dark:text-earth-300">
              We couldn't find a project with that id.
            </p>
            <Link to="/projects" className="btn-primary inline-flex">
              <ArrowLeft size={20} />
              <span>Back to Projects</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const images = projectImages(project);

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-950">
      <section className="section-padding bg-gradient-to-br from-earth-50 via-earth-100/30 to-earth-200/30 dark:from-earth-950 dark:via-earth-900/50 dark:to-earth-800/30">
        <div className="container-custom space-y-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-earth-600 hover:text-earth-800 dark:text-earth-300 dark:hover:text-earth-50 font-medium transition-colors duration-300"
          >
            <ArrowLeft size={18} />
            <span>Back to Projects</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <span className="tag tag-blue">{project.category}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-earth-800 dark:text-earth-50 text-shadow-sm">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="card-elevated p-8 space-y-8">
            <p className="text-lg text-earth-600 dark:text-earth-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="tag tag-gray">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-earth-100 dark:border-earth-800">
              {project.github && project.github !== '#' && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost group/link"
                  aria-label={`${project.title} source code on GitHub`}
                >
                  <Github size={18} className="group-hover/link:scale-110 transition-transform duration-300" />
                  <span>Code</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost group/link text-spark-600 hover:text-spark-600 hover:bg-spark-500/10"
                  aria-label={`Open ${project.title} live site in a new tab`}
                >
                  <span>Live Site →</span>
                </a>
              )}
            </div>
          </div>

          {images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-50">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open ${project.title} screenshot ${index + 1} of ${images.length}`}
                    className="relative block w-full h-48 rounded-xl overflow-hidden border border-earth-100 dark:border-earth-800 group/img cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-earth-400"
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${src}`}
                      alt={`${project.title} screenshot ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          title={project.title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
