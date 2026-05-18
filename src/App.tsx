import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardTab from './pages/DashboardTab';
import WeeklyTab from './pages/WeeklyTab';
import MonthlyTab from './pages/MonthlyTab';
import GoalsTab from './pages/GoalsTab';
import ReportsTab from './pages/ReportsTab';
import { TabId } from './types';

const TAB_TITLES: Record<TabId, string> = {
  dashboard: 'Dashboard',
  weekly: 'Weekly View',
  monthly: 'Monthly Report',
  goals: 'Goals',
  reports: 'Past Reports',
};

const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { loading, error } = useApp();

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'weekly': return <WeeklyTab />;
      case 'monthly': return <MonthlyTab />;
      case 'goals': return <GoalsTab />;
      case 'reports': return <ReportsTab />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="app-main">
        <Header title={TAB_TITLES[activeTab]} />
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}
        <main className="app-content">
          {loading ? (
            <div className="loading-screen">
              <div className="loading-spinner" />
              <p>Connecting to database…</p>
            </div>
          ) : (
            renderTab()
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppShell />
  </AppProvider>
);

export default App;
