import { useState } from 'react';
import { Mail, Linkedin, Github, Download, Check, Copy } from 'lucide-react';

const EMAIL = 'duc.tri.nguyen0186@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/duc-nguyen-33716b1b6/';
const GITHUB_URL = 'https://github.com/ductringuyen-0618';

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable - the email is still shown and mailto-linked.
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative section-padding bg-gradient-to-br from-earth-50 via-earth-100/30 to-earth-200/30 dark:from-earth-950 dark:via-earth-900/50 dark:to-earth-800/30 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-earth-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-earth-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-earth-900/60 backdrop-blur-sm border border-earth-200 dark:border-earth-700 rounded-full shadow-sm">
              <span className="text-sm font-semibold text-earth-700 dark:text-earth-200">Get in touch</span>
            </div>

            <h1 className="text-6xl font-bold text-earth-800 dark:text-earth-50 text-shadow-sm">Contact</h1>

            <p className="text-xl text-earth-600 dark:text-earth-300 leading-relaxed max-w-3xl mx-auto">
              Have a role, a project, or just want to talk shop? I'm always happy to connect.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="section-padding bg-white dark:bg-earth-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-elevated p-10 group hover:scale-105 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-400 to-earth-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-earth-500/25 group-hover:shadow-xl group-hover:shadow-earth-500/30 transition-all duration-500">
                <Mail size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-earth-800 dark:text-earth-50 mb-2">Email</h3>
              <p className="text-earth-600 dark:text-earth-300 mb-6 break-all">{EMAIL}</p>
              <div className="mt-auto flex flex-col gap-3 w-full">
                <a href={`mailto:${EMAIL}`} className="btn-primary w-full">
                  <Mail size={18} />
                  <span>Send an email</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="btn-secondary w-full"
                  aria-label="Copy email address"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Copied!' : 'Copy email'}</span>
                </button>
              </div>
            </div>

            <div className="card-elevated p-10 group hover:scale-105 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-400 to-earth-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-earth-500/25 group-hover:shadow-xl group-hover:shadow-earth-500/30 transition-all duration-500">
                <Linkedin size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-earth-800 dark:text-earth-50 mb-2">LinkedIn</h3>
              <p className="text-earth-600 dark:text-earth-300 mb-6">Connect with me professionally</p>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-auto"
              >
                <Linkedin size={18} />
                <span>View LinkedIn</span>
              </a>
            </div>

            <div className="card-elevated p-10 group hover:scale-105 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-earth-400 to-earth-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-earth-500/25 group-hover:shadow-xl group-hover:shadow-earth-500/30 transition-all duration-500">
                <Github size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-earth-800 dark:text-earth-50 mb-2">GitHub</h3>
              <p className="text-earth-600 dark:text-earth-300 mb-6">Check out my code and projects</p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mt-auto"
              >
                <Github size={18} />
                <span>View GitHub</span>
              </a>
            </div>
          </div>

          <div className="text-center mt-16">
            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4 group inline-flex"
            >
              <Download size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
