import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, History, FileText, Briefcase, FolderOpen, Package, UserCheck, Building, CheckSquare, Clock, Bell, BarChart3, Users, LogOut } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { useCrm } from '../context/CrmContext';

export default function Sidebar() {
  const { serverSmtp } = useCampaign();
  const crmContext = useCrm();
  const unreadCount = crmContext?.notifications?.filter(n => !n.read).length || 0;

  const currentUserRole = localStorage.getItem('crm_user_role');
  const showUserMgmt = currentUserRole === 'super_admin' || currentUserRole === 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user_id');
    localStorage.removeItem('crm_user_role');
    localStorage.removeItem('crm_tenant_id');
    window.location.reload();
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <div className="logo-container">
        <div className="logo-text">Crimson</div>
        <div className="subtitle">Bulk Email Sender</div>
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '12px 16px 4px 16px' }}>Campaigns & Docs</div>
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
        <NavLink
          to="/document-history"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <FolderOpen size={18} />
          Document History
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          Product List
        </NavLink>

        <div style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '16px 16px 4px 16px', borderTop: '1px solid rgba(255,255,255,0.03)', marginTop: '8px' }}>CRM System</div>
        
        <NavLink
          to="/crm/dashboard"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          CRM Dashboard
          {unreadCount > 0 && (
            <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', animation: 'pulse 2s infinite' }}>
              {unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/crm/leads"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          Leads
        </NavLink>

        <NavLink
          to="/crm/contacts"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <UserCheck size={18} />
          Contacts
        </NavLink>

        <NavLink
          to="/crm/companies"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Building size={18} />
          Companies
        </NavLink>

        <NavLink
          to="/crm/deals"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Briefcase size={18} />
          Sales Pipeline
        </NavLink>

        <NavLink
          to="/crm/tasks"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <CheckSquare size={18} />
          Task Board
        </NavLink>

        <NavLink
          to="/crm/activities"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Clock size={18} />
          Interactions
        </NavLink>

        <NavLink
          to="/crm/followups"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Bell size={18} />
          Follow Ups
        </NavLink>

        <NavLink
          to="/crm/reports"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          Reports
        </NavLink>

        {showUserMgmt && (
          <NavLink
            to="/crm/users"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            User Accounts
          </NavLink>
        )}

        <NavLink
          to="/crm/settings"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={18} />
          CRM Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 16px', color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>

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
