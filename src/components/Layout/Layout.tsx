import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AgentSidebar from '../AgentDemo';
import ErrorBoundary from '../ErrorBoundary';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Global AI Agent Chat - Available on all pages */}
      <ErrorBoundary>
        <AgentSidebar />
      </ErrorBoundary>
    </div>
  );
}
