import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, ShieldAlert, Calendar, Clock, Trash2, Download, FileText, Edit, FolderOpen } from 'lucide-react';
import { useProposal } from '../context/ProposalContext';
import { useInvoice } from '../context/InvoiceContext';
import ProposalPreview from '../components/ProposalPreview';
import InvoicePreview from '../components/InvoicePreview';

export default function DocumentHistory() {
  const navigate = useNavigate();
  const { loadProposalData, handleDownloadPDF } = useProposal();
  const { loadInvoiceData, handleDownloadPDF: handleDownloadInvoicePDF, handleDownloadCombinedPDF } = useInvoice();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDocumentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching document history:', err);
      setError('Failed to retrieve document history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document record from history?')) return;
    
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      
      // Update local state
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete history record: ' + err.message);
    }
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    // Load appropriate data into React contexts
    if (item.proposalData) {
      loadProposalData(item.proposalData);
    }
    if (item.invoiceData) {
      loadInvoiceData(item.invoiceData);
    }

    // Redirect to correct editor
    if (item.type === 'proposal') {
      navigate('/proposal');
    } else if (item.type === 'invoice') {
      navigate('/invoice');
    } else {
      // For both, redirect to proposal page (it renders both previews now)
      navigate('/proposal');
    }
  };

  const handleDownload = async (item, e) => {
    e.stopPropagation();
    setActionLoadingId(item._id);

    try {
      // 1. Temporarily load history data into active contexts
      if (item.proposalData) {
        loadProposalData(item.proposalData);
      }
      if (item.invoiceData) {
        loadInvoiceData(item.invoiceData);
      }

      // 2. Wait 300ms for React context to update states and DOM elements to paint
      await new Promise(resolve => setTimeout(resolve, 350));

      // 3. Trigger download based on item type
      if (item.type === 'proposal') {
        await handleDownloadPDF({ skipPrompt: true });
      } else if (item.type === 'invoice') {
        await handleDownloadInvoicePDF({ skipPrompt: true });
      } else if (item.type === 'both') {
        await handleDownloadCombinedPDF({ skipPrompt: true });
      }
    } catch (err) {
      console.error('Re-download failed:', err);
      alert('Re-download failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header className="history-header">
        <h1>Document Download History</h1>
        <button
          className="btn-icon-label"
          onClick={fetchDocumentHistory}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh History
        </button>
      </header>

      {loading && documents.length === 0 ? (
        <div className="empty-state" style={{ borderStyle: 'solid' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
          <p>Loading document history records...</p>
        </div>
      ) : error ? (
        <div className="empty-state" style={{ borderStyle: 'solid', borderColor: 'var(--error)' }}>
          <ShieldAlert size={32} style={{ color: 'var(--error)' }} />
          <p style={{ color: 'var(--error)' }}>{error}</p>
          <button className="btn-secondary" onClick={fetchDocumentHistory}>Try Again</button>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={24} />
          </div>
          <h3>No Documents Downloaded Yet</h3>
          <p>Once you download a Proposal, Invoice, or a Combined document, a history record will appear here!</p>
        </div>
      ) : (
        <div className="history-grid">
          {documents.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            // Set badge class/label
            let badgeClass = 'pending';
            let badgeLabel = 'Document';
            if (item.type === 'proposal') {
              badgeClass = 'completed'; // Purple in standard layouts
              badgeLabel = 'Proposal';
            } else if (item.type === 'invoice') {
              badgeClass = 'sending'; // Blue/Indigo in standard layouts
              badgeLabel = 'Quotation / Invoice';
            } else if (item.type === 'both') {
              badgeClass = 'success'; // Emerald in standard layouts
              badgeLabel = 'Combined Combo';
            }

            return (
              <div key={item._id} className="history-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="history-card-header">
                    <div>
                      <div className="history-subject" style={{ fontSize: '16px', fontWeight: '800' }}>
                        {item.clientName}
                      </div>
                      <span className={`badge ${badgeClass}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                        {badgeLabel}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formattedDate}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Clock size={11} /> {formattedTime}</span>
                    </div>
                  </div>

                  <div className="history-meta" style={{ marginTop: '15px' }}>
                    <div className="history-meta-item">
                      <FileText size={14} />
                      <span>Ref ID: <strong style={{ color: 'var(--text-primary)' }}>{item.documentId}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="history-actions" style={{ marginTop: '20px', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    onClick={(e) => handleDownload(item, e)}
                    disabled={actionLoadingId !== null}
                    style={{ flex: 1, gap: '6px' }}
                  >
                    {actionLoadingId === item._id ? (
                      <Loader2 size={13} className="spin" />
                    ) : (
                      <Download size={13} />
                    )}
                    Download
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={(e) => handleEdit(item, e)}
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', border: 'none' }}
                  >
                    <Edit size={13} />
                    Edit
                  </button>
                  <button
                    className="btn-danger-outline"
                    onClick={(e) => handleDelete(item._id, e)}
                    style={{ padding: '8px 12px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offscreen Previews for background printing capture */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', height: 'auto', pointerEvents: 'none' }}>
        <ProposalPreview hideToolbar={true} />
        <InvoicePreview hideToolbar={true} />
      </div>
    </div>
  );
}
