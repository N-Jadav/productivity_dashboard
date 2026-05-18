import React from 'react';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">
          {greeting} 👋 &nbsp;·&nbsp; {format(now, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      <div className="header-right">
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="header-avatar">N</div>
      </div>
    </header>
  );
};

export default Header;
