import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CampaignProvider } from './context/CampaignContext';
import { InvoiceProvider } from './context/InvoiceContext';
import Sidebar from './components/Sidebar';
import CampaignDispatcher from './pages/CampaignDispatcher';
import SmtpSettings from './pages/SmtpSettings';
import SentCampaigns from './pages/SentCampaigns';
import InvoiceGenerator from './pages/InvoiceGenerator';

export default function App() {
  return (
    <BrowserRouter>
      <CampaignProvider>
        <InvoiceProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/dispatcher" element={<CampaignDispatcher />} />
                <Route path="/settings" element={<SmtpSettings />} />
                <Route path="/history" element={<SentCampaigns />} />
                <Route path="/invoice" element={<InvoiceGenerator />} />
                <Route path="*" element={<Navigate to="/dispatcher" replace />} />
              </Routes>
            </main>
          </div>
        </InvoiceProvider>
      </CampaignProvider>
    </BrowserRouter>
  );
}
