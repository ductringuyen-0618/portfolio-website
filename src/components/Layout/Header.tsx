import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-earth-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
              DN
            </div>
            <div>
              <h1 className="text-xl font-bold text-earth-800">Duc Nguyen</h1>
              <p className="text-sm text-earth-500">Software Engineer</p>
            </div>
          </div>
          <nav className="flex space-x-6">
            <Link to="/" className="text-earth-600 hover:text-earth-800">Home</Link>
            <Link to="/projects" className="text-earth-500 hover:text-earth-700">Projects</Link>
            <Link to="/about" className="text-earth-500 hover:text-earth-700">About</Link>
            <a href="https://github.com/ductringuyen-0618" target="_blank" rel="noopener noreferrer" className="text-earth-500 hover:text-earth-700">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
