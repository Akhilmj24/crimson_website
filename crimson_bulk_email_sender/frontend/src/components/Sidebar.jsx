import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, History, FileText, Briefcase, FolderOpen, Package, UserCheck, Building, CheckSquare, Clock, Bell, BarChart3, Users, LogOut, ShoppingBag, CreditCard, Receipt } from 'lucide-react';
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

  const menuSections = [
    {
      id: 'campaigns-docs',
      title: 'Campaigns & Docs',
      items: [
        { to: '/dispatcher', label: 'Campaign Dispatcher', icon: LayoutDashboard },
        { to: '/settings', label: 'SMTP Settings', icon: Settings },
        { to: '/history', label: 'Sent Campaigns', icon: History },
        { to: '/invoice', label: 'Invoice Generator', icon: FileText },
        { to: '/proposal', label: 'Proposal Creator', icon: Briefcase },
        { to: '/document-history', label: 'Document History', icon: FolderOpen },
        { to: '/products', label: 'Product List', icon: Package }
      ]
    },
    {
      id: 'crm-system',
      title: 'CRM System',
      items: [
        {
          to: '/crm/dashboard',
          label: 'CRM Dashboard',
          icon: LayoutDashboard,
          badge: unreadCount > 0 ? unreadCount : null
        },
        { to: '/crm/leads', label: 'Leads', icon: Users },
        { to: '/crm/deals', label: 'Sales Pipeline', icon: Briefcase },
        { to: '/crm/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/crm/income', label: 'Income', icon: CreditCard },
        { to: '/crm/expenses', label: 'Expenses log', icon: Receipt },
        // { to: '/crm/contacts', label: 'Contacts', icon: UserCheck },
        // { to: '/crm/companies', label: 'Companies', icon: Building },
        { to: '/crm/tasks', label: 'Task Board', icon: CheckSquare },
        { to: '/crm/activities', label: 'Interactions', icon: Clock },
        { to: '/crm/followups', label: 'Follow Ups', icon: Bell },
        { to: '/crm/reports', label: 'Reports', icon: BarChart3 },
        { to: '/crm/users', label: 'User Accounts', icon: Users, show: showUserMgmt },
        { to: '/crm/settings', label: 'CRM Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-text">Crimson</div>
        <div className="subtitle">Bulk Email Sender</div>
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuSections.map((section, sectionIdx) => (
          <React.Fragment key={section.id}>
            <div
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                padding: sectionIdx === 0 ? '12px 16px 4px 16px' : '16px 16px 4px 16px',
                borderTop: sectionIdx === 0 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                marginTop: sectionIdx === 0 ? '0' : '8px'
              }}
            >
              {section.title}
            </div>
            {section.items
              .filter(item => item.show !== false)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '8px' }}>
        {/* Logged in User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 4px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                {(localStorage.getItem('crm_user_id') || 'User').substring(0, 2)}
              </div>
              {/* Connection Status Dot Indicator */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: serverSmtp.dbConnected ? 'var(--success)' : 'var(--warning)',
                  border: '2px solid #1a1815', // matching var(--bg-card) hex value exactly
                  boxShadow: serverSmtp.dbConnected ? '0 0 6px var(--success)' : '0 0 6px var(--warning)'
                }}
                title={serverSmtp.dbConnected ? "MongoDB Connected" : "In-Memory Fallback Mode"}
              ></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {localStorage.getItem('crm_user_id') || 'User'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--secondary)', textTransform: 'capitalize', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUserRole || 'Agent'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              marginLeft: '4px',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
