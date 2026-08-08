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
                      <Route path="/dispatcher" element={<CampaignDispatcher />} />
                      <Route path="/settings" element={<SmtpSettings />} />
                      <Route path="/history" element={<SentCampaigns />} />
                      <Route path="/invoice" element={<InvoiceGenerator />} />
                      <Route path="/proposal" element={<ProposalGenerator />} />
                      <Route path="/document-history" element={<DocumentHistory />} />
                      <Route path="/products" element={<ProductList />} />

                      {/* CRM Routes */}
                      <Route path="/crm/dashboard" element={<CrmDashboard />} />
                      <Route path="/crm/leads" element={<CrmLeads />} />
                      <Route path="/crm/contacts" element={<CrmContacts />} />
                      <Route path="/crm/companies" element={<CrmCompanies />} />
                      <Route path="/crm/deals" element={<CrmDeals />} />
                      <Route path="/crm/tasks" element={<CrmTasks />} />
                      <Route path="/crm/activities" element={<CrmActivities />} />
                      <Route path="/crm/followups" element={<CrmFollowUps />} />
                      <Route path="/crm/reports" element={<CrmReports />} />
                      <Route path="/crm/settings" element={<CrmSettings />} />
                      <Route path="/crm/users" element={<CrmUserManagement />} />
                      <Route path="/crm/orders" element={<CrmOrders />} />
                      <Route path="/crm/income" element={<CrmAccounts />} />
                      <Route path="/crm/expenses" element={<CrmExpenses />} />
                      <Route path="/crm/accounting" element={<CrmAccounting />} />

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
