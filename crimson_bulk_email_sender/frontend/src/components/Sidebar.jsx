import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, History, FileText, Briefcase, FolderOpen, Package, UserCheck, Building, CheckSquare, Clock, Bell, BarChart3, Users, LogOut, ShoppingBag, CreditCard, Receipt, Scale } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { useCrm } from '../context/CrmContext';

export default function Sidebar() {
  const { serverSmtp } = useCampaign();
  const crmContext = useCrm();
  const unreadCount = crmContext?.notifications?.filter(n => !n.read).length || 0;

  const currentUserRole = localStorage.getItem('crm_user_role');
  const currentUserName = localStorage.getItem('crm_user_name') || localStorage.getItem('crm_user_id') || 'User';
  const showUserMgmt = currentUserRole === 'super_admin' || currentUserRole === 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user_id');
    localStorage.removeItem('crm_user_name');
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
        { to: '/crm/accounting', label: 'Accounting', icon: Scale },
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
    <aside className="w-[220px] shrink-0 flex flex-col bg-bg-card backdrop-blur-md border border-border rounded-[14px] p-4 h-full shadow-[0_15px_35px_rgba(0,0,0,0.2)] max-[900px]:w-full max-[900px]:h-auto max-[900px]:p-5">
      <div className="p-2 rounded-[10px] mb-2 flex justify-center">
        <img src="/logo-op.png" alt="Logo" className="h-20 w-20 object-contain" />
      </div>

      <nav className="flex flex-col gap-1 mt-4 grow overflow-y-auto pr-[2px] max-[900px]:flex-row max-[900px]:justify-around max-[900px]:mt-[15px] max-[900px]:overflow-visible">
        {menuSections.map((section, sectionIdx) => (
          <React.Fragment key={section.id}>
            <div
              className={`text-[9px] font-bold text-text-muted uppercase tracking-[1.5px] ${sectionIdx === 0
                ? 'pt-3 px-4 pb-1 mt-0 border-t-0'
                : 'pt-4 px-4 pb-1 mt-2 border-t border-white/5'
                }`}
            >
              {section.title}
            </div>
            {section.items
              .filter(item => item.show !== false)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-[10px_12px] rounded-lg text-text-secondary font-semibold text-[12.5px] cursor-pointer border border-transparent transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/5 hover:text-text-primary hover:translate-x-0.5 max-[900px]:hover:transform-none ${isActive
                      ? 'bg-gradient-to-br from-primary to-primary-light text-white border-secondary/25 shadow-[0_8px_20px_rgba(153,15,2,0.2)]'
                      : ''
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[10px] animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="border-t border-white/5 pt-3 mt-2">
        {/* Logged in User Profile Info */}
        <div className="flex items-center justify-between py-1 pr-3 pl-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-xs uppercase">
                {currentUserName.substring(0, 2)}
              </div>
              {/* Connection Status Dot Indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1a1815] ${serverSmtp.dbConnected
                  ? 'bg-success shadow-[0_0_6px_#10B981]'
                  : 'bg-warning shadow-[0_0_6px_#F59E0B]'
                  }`}
                title={serverSmtp.dbConnected ? "MongoDB Connected" : "In-Memory Fallback Mode"}
              ></span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-semibold text-text-primary truncate">
                {currentUserName}
              </span>
              <span className="text-[10px] text-secondary capitalize truncate">
                {currentUserRole || 'Agent'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-transparent border-0 cursor-pointer text-text-muted flex items-center justify-center p-1.5 rounded-md transition-all duration-200 ml-1 shrink-0 hover:text-error hover:bg-error/10"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
