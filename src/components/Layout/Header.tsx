import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-earth-900 shadow transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-earth-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shrink-0">
              DN
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-earth-800 dark:text-earth-50 truncate">Duc Nguyen</h1>
              <p className="text-sm text-earth-500 dark:text-earth-400 truncate">Software Engineer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/duc-nguyen-33716b1b6/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 text-sm font-medium whitespace-nowrap"
            >
              LinkedIn
            </a>
            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-4 !py-2 text-sm whitespace-nowrap"
            >
              Resume
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={theme === 'dark'}
              className="p-2 rounded-lg text-earth-500 hover:text-earth-700 hover:bg-earth-100 dark:text-earth-300 dark:hover:text-earth-100 dark:hover:bg-earth-800 transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <nav className="w-full sm:w-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-earth-100 dark:border-earth-800 sm:border-t-0 pt-3 sm:pt-0">
            <Link to="/" className="text-earth-600 hover:text-earth-800 dark:text-earth-300 dark:hover:text-earth-50 whitespace-nowrap">Home</Link>
            <Link to="/projects" className="text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 whitespace-nowrap">Projects</Link>
            <Link to="/about" className="text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 whitespace-nowrap">About</Link>
            <Link to="/contact" className="text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 whitespace-nowrap">Contact</Link>
            <a
              href="https://github.com/ductringuyen-0618"
              target="_blank"
              rel="noopener noreferrer"
              className="text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 whitespace-nowrap"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
