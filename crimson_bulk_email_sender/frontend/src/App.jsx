import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { ProposalProvider } from './context/ProposalContext';
import { InvoiceProvider } from './context/InvoiceContext';
import Sidebar from './components/Sidebar';
import CampaignDispatcher from './pages/CampaignDispatcher';
import SmtpSettings from './pages/SmtpSettings';
import SentCampaigns from './pages/SentCampaigns';
import InvoiceGenerator from './pages/InvoiceGenerator';
import ProposalGenerator from './pages/ProposalGenerator';
import DocumentHistory from './pages/DocumentHistory';

export default function App() {
  return (
    <BrowserRouter>
      <CampaignProvider>
        <ProposalProvider>
          <InvoiceProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/dispatcher" element={<CampaignDispatcher />} />
                <Route path="/settings" element={<SmtpSettings />} />
                <Route path="/history" element={<SentCampaigns />} />
                <Route path="/invoice" element={<InvoiceGenerator />} />
                <Route path="/proposal" element={<ProposalGenerator />} />
                <Route path="/document-history" element={<DocumentHistory />} />
                <Route path="*" element={<Navigate to="/dispatcher" replace />} />
              </Routes>
            </main>
          </div>
         </InvoiceProvider>
        </ProposalProvider>
      </CampaignProvider>
    </BrowserRouter>
  );
}
