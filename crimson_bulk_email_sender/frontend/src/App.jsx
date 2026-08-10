import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { ProposalProvider } from './context/ProposalContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { CrmProvider } from './context/CrmContext';
import Sidebar from './components/Sidebar';
import CampaignDispatcher from './pages/CampaignDispatcher';
import SmtpSettings from './pages/SmtpSettings';
import SentCampaigns from './pages/SentCampaigns';
import InvoiceGenerator from './pages/InvoiceGenerator';
import ProposalGenerator from './pages/ProposalGenerator';
import DocumentHistory from './pages/DocumentHistory';
import ProductList from './pages/ProductList';
import Login from './pages/Login';

// CRM pages
import CrmDashboard from './modules/crm/CrmDashboard';
import CrmLeads from './modules/crm/CrmLeads';
import CrmContacts from './modules/crm/CrmContacts';
import CrmCompanies from './modules/crm/CrmCompanies';
import CrmDeals from './modules/crm/CrmDeals';
import CrmTasks from './modules/crm/CrmTasks';
import CrmActivities from './modules/crm/CrmActivities';
import CrmFollowUps from './modules/crm/CrmFollowUps';
import CrmReports from './modules/crm/CrmReports';
import CrmSettings from './modules/crm/CrmSettings';
import CrmUserManagement from './modules/crm/CrmUserManagement';
import CrmOrders from './modules/crm/CrmOrders';
import CrmAccounts from './modules/crm/CrmAccounts';
import CrmExpenses from './modules/crm/CrmExpenses';
import CrmAccounting from './modules/crm/CrmAccounting';

const ProtectedRoute = ({ element, resource }) => {
  const currentUserRole = localStorage.getItem('crm_user_role') || 'Agent';
  let customPermissions = {};
  try {
    customPermissions = JSON.parse(localStorage.getItem('crm_custom_permissions') || '{}');
  } catch(e) {}
  const hasCustomPerms = Object.keys(customPermissions).length > 0;

  const hasViewPermission = (res) => {
    if (!res) return true;
    if (res === 'admin_only') return currentUserRole === 'super_admin' || currentUserRole === 'Admin';

    if (hasCustomPerms) {
       const perms = customPermissions[res] || [];
       const allPerms = customPermissions['*'] || [];
       return perms.includes('view') || allPerms.includes('view');
    }
    
    if (currentUserRole === 'super_admin' || currentUserRole === 'Admin') return true;
    
    const rolePermissions = {
      Manager: ['crm.dashboard', 'crm.leads', 'crm.contacts', 'crm.companies', 'crm.deals', 'crm.tasks', 'crm.activities', 'crm.reports', 'crm.settings', 'crm.orders', 'crm.accounts', 'crm.expenses', 'campaign.dispatcher', 'campaign.settings', 'campaign.history', 'docs.invoice', 'docs.proposal', 'docs.history', 'products.list'],
      Agent: ['crm.dashboard', 'crm.leads', 'crm.contacts', 'crm.companies', 'crm.deals', 'crm.tasks', 'crm.activities', 'crm.orders', 'crm.accounts', 'crm.expenses', 'campaign.dispatcher', 'campaign.settings', 'campaign.history', 'docs.invoice', 'docs.proposal', 'docs.history', 'products.list']
    };
    return (rolePermissions[currentUserRole] || []).includes(res);
  };

  if (!hasViewPermission(resource)) {
    return <Navigate to="/crm/dashboard" replace />;
  }

  return element;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('crm_token'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <CampaignProvider>
        <ProposalProvider>
          <InvoiceProvider>
            <CrmProvider>
              {!isAuthenticated ? (
                <div className="block py-10 px-5 bg-bg-dark min-h-screen">
                  <Login onLoginSuccess={handleLoginSuccess} />
                </div>
              ) : (
                <div className="flex h-screen max-h-screen gap-5 p-5 overflow-hidden max-[900px]:flex-col max-[900px]:gap-[15px] max-[900px]:h-auto max-[900px]:max-h-none max-[900px]:overflow-visible max-[900px]:p-2.5 bg-bg-dark">
                  <Sidebar />
                  <main className="flex-grow h-full overflow-y-auto pr-1 max-[900px]:h-auto max-[900px]:overflow-y-visible max-[900px]:pr-0">
                    <Routes>
                      <Route path="/dispatcher" element={<ProtectedRoute element={<CampaignDispatcher />} resource="campaign.dispatcher" />} />
                      <Route path="/settings" element={<ProtectedRoute element={<SmtpSettings />} resource="campaign.settings" />} />
                      <Route path="/history" element={<ProtectedRoute element={<SentCampaigns />} resource="campaign.history" />} />
                      <Route path="/invoice" element={<ProtectedRoute element={<InvoiceGenerator />} resource="docs.invoice" />} />
                      <Route path="/proposal" element={<ProtectedRoute element={<ProposalGenerator />} resource="docs.proposal" />} />
                      <Route path="/document-history" element={<ProtectedRoute element={<DocumentHistory />} resource="docs.history" />} />
                      <Route path="/products" element={<ProtectedRoute element={<ProductList />} resource="products.list" />} />

                      {/* CRM Routes */}
                      <Route path="/crm/dashboard" element={<ProtectedRoute element={<CrmDashboard />} resource="crm.dashboard" />} />
                      <Route path="/crm/leads" element={<ProtectedRoute element={<CrmLeads />} resource="crm.leads" />} />
                      <Route path="/crm/contacts" element={<ProtectedRoute element={<CrmContacts />} resource="crm.contacts" />} />
                      <Route path="/crm/companies" element={<ProtectedRoute element={<CrmCompanies />} resource="crm.companies" />} />
                      <Route path="/crm/deals" element={<ProtectedRoute element={<CrmDeals />} resource="crm.deals" />} />
                      <Route path="/crm/tasks" element={<ProtectedRoute element={<CrmTasks />} resource="crm.tasks" />} />
                      <Route path="/crm/activities" element={<ProtectedRoute element={<CrmActivities />} resource="crm.activities" />} />
                      <Route path="/crm/followups" element={<ProtectedRoute element={<CrmFollowUps />} resource="crm.tasks" />} />
                      <Route path="/crm/reports" element={<ProtectedRoute element={<CrmReports />} resource="crm.reports" />} />
                      <Route path="/crm/settings" element={<ProtectedRoute element={<CrmSettings />} resource="crm.settings" />} />
                      <Route path="/crm/users" element={<ProtectedRoute element={<CrmUserManagement />} resource="admin_only" />} />
                      <Route path="/crm/orders" element={<ProtectedRoute element={<CrmOrders />} resource="crm.orders" />} />
                      <Route path="/crm/income" element={<ProtectedRoute element={<CrmAccounts />} resource="crm.accounts" />} />
                      <Route path="/crm/expenses" element={<ProtectedRoute element={<CrmExpenses />} resource="crm.expenses" />} />
                      <Route path="/crm/accounting" element={<ProtectedRoute element={<CrmAccounting />} resource="crm.accounts" />} />

                      <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              )}
            </CrmProvider>
          </InvoiceProvider>
        </ProposalProvider>
      </CampaignProvider>
    </BrowserRouter>
  );
}
