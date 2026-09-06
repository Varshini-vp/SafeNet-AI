import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AlertBanner from './components/AlertBanner';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import VehicleTrackingPage from './pages/VehicleTrackingPage';
import RiskPredictionPage from './pages/RiskPredictionPage';
import ActiveAlertsPage from './pages/ActiveAlertsPage';
import RiskHotspotsMapPage from './pages/RiskHotspotsMapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import CameraManagementPage from './pages/CameraManagementPage';
import SystemHealthPage from './pages/SystemHealthPage';
import SettingsPage from './pages/SettingsPage';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center font-mono text-cyan-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span>INITIALIZING SAFENET AI ENVIRONMENT...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'live-monitoring':
        return <LiveMonitoringPage />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'vehicles':
        return <VehicleTrackingPage />;
      case 'risk-predictions':
        return <RiskPredictionPage />;
      case 'alerts':
        return <ActiveAlertsPage />;
      case 'hotspots':
        return <RiskHotspotsMapPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'cameras':
        return <CameraManagementPage />;
      case 'health':
        return <SystemHealthPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Command Center Header */}
      <Header />

      {/* Main Split Layout: Left Sidebar + Right Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto bg-[#0a0d14]">
          {renderPage()}
        </main>
      </div>

      {/* Real-Time Critical Incident Floating Notification */}
      <AlertBanner onNavigateToAlerts={() => setCurrentTab('alerts')} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <MainLayout />
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;
