import React from 'react';
import CampaignPreview from '../components/CampaignPreview';
import RecipientSetup from '../components/RecipientSetup';
import ProgressDashboard from '../components/ProgressDashboard';

export default function CampaignDispatcher() {
  return (
    <div>
      <header>
        <h1>Campaign Advertisement Dashboard</h1>
      </header>

      <div className="grid two-column-grid">
        <CampaignPreview />
        <RecipientSetup />
        <ProgressDashboard />
      </div>
    </div>
  );
}
