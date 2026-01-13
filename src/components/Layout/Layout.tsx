import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
// import AgentSidebar from '../AgentDemo';
// import ErrorBoundary from '../ErrorBoundary';

// Feature flag - set to true to enable AI agent (requires WebGPU)
const AI_AGENT_ENABLED = false;

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Global AI Agent Chat - Disabled for now (requires WebGPU) */}
      {AI_AGENT_ENABLED && (
        <div>{/* <AgentSidebar /> */}</div>
      )}
    </div>
  );
}
