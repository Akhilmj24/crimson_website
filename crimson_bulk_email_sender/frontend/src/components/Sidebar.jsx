import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, History, FileText, Briefcase } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function Sidebar() {
  const { serverSmtp } = useCampaign();

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-text">Crimson</div>
        <div className="subtitle">Bulk Email Sender</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dispatcher"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          Campaign Dispatcher
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          SMTP Settings
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          Sent Campaigns
        </NavLink>
        <NavLink
          to="/invoice"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          Invoice Generator
        </NavLink>
        <NavLink
          to="/proposal"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Briefcase size={18} />
          Proposal Creator
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {serverSmtp.dbConnected ? (
          <div className="db-status-badge connected">
            <span className="db-status-dot"></span>
            MongoDB Connected
          </div>
        ) : (
          <div className="db-status-badge fallback">
            <span className="db-status-dot"></span>
            In-Memory Mode
          </div>
        )}
      </div>
    </aside>
  );
}
