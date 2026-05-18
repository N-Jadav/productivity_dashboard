import React from 'react';
import { LayoutDashboard, Calendar, BarChart2, Target, ClipboardList } from 'lucide-react';
import { TabId } from '../../types';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'weekly', label: 'Weekly', icon: <Calendar size={20} /> },
  { id: 'monthly', label: 'Monthly', icon: <BarChart2 size={20} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { id: 'reports', label: 'Reports', icon: <ClipboardList size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚡</span>
        <span className="sidebar-logo-text">FocusFlow</span>
      </div>
      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="sidebar-tab-icon">{tab.icon}</span>
            <span className="sidebar-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">Track daily. Win weekly.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
