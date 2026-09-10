
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const basename = import.meta.env.PROD ? '/portfolio-website' : '';

  return (
    <ThemeProvider>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
