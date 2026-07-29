import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Settings, 
  Mail, 
  TrendingUp, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  Trash2, 
  FileText, 
  Users,
  ExternalLink,
  History,
  LayoutDashboard,
  RefreshCw,
  Database,
  Calendar,
  Clock,
  Server,
  Upload,
  Search,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
  const [smtpMode, setSmtpMode] = useState('env'); // 'env' or 'custom'
  const [serverSmtp, setServerSmtp] = useState({
    configured: false,
    smtpUser: '',
    smtpHost: '',
    smtpPort: '',
    dbConnected: false
  });
  const [smtpChecking, setSmtpChecking] = useState(true);
  const [smtpError, setSmtpError] = useState('');

  // Custom SMTP configuration state
  const [customSmtp, setCustomSmtp] = useState({
    host: '',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    fromName: 'Crimson Group LLP',
    fromEmail: 'crimsongroupllp@gmail.com'
  });

  // Email queue input state
  const [emailInput, setEmailInput] = useState('');
  const [parsedEmails, setParsedEmails] = useState([]);
  const [jsonFormatType, setJsonFormatType] = useState(null); // 'json' or 'list' or null
  const [jsonStatus, setJsonStatus] = useState({ valid: true, message: '' });

  // Excel Recipient Import States
  const [importTab, setImportTab] = useState('manual'); // 'manual' or 'excel'
  const [excelContacts, setExcelContacts] = useState([]); // Array of { name, email, checked }
  const [excelSearchQuery, setExcelSearchQuery] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Dispatched queue status states
  const [isSending, setIsSending] = useState(false);
  const [progressText, setProgressText] = useState('Ready to dispatch queue...');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    success: 0,
    error: 0
  });

  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      text: 'System Ready. Paste email list and configure SMTP parameters.',
      type: 'info'
    }
  ]);
  const [recipientsStatus, setRecipientsStatus] = useState([]); // Array of { email, status, message }
  
  // Sent Campaigns History State
  const [campaigns, setCampaigns] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Detailed view campaign
  const [modalTab, setModalTab] = useState('recipients'); // 'recipients' or 'logs' in modal

  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Check server SMTP & database settings on mount
  useEffect(() => {
    checkServerSmtpStatus();
    fetchCampaignHistory();
  }, []);

  // Parse emails dynamically as the input changes
  useEffect(() => {
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setParsedEmails([]);
      setJsonFormatType(null);
      setJsonStatus({ valid: true, message: '' });
      return;
    }

    // Try parsing as JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const emails = parsed.map(e => String(e).trim()).filter(e => e.length > 0);
          setParsedEmails(emails);
          setJsonFormatType('json');
          setJsonStatus({ valid: true, message: 'Valid JSON Array Detected' });
          return;
        } else {
          setJsonStatus({ valid: false, message: 'JSON is not a flat array' });
        }
      } catch (err) {
        setJsonStatus({ valid: false, message: `Invalid JSON format: ${err.message}` });
      }
    } else {
      setJsonStatus({ valid: true, message: '' });
    }

    // Fall back to separator parsing (commas, semicolons, or newlines)
    const emails = trimmed
      .split(/[,\n;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    setParsedEmails(emails);
    setJsonFormatType('list');
  }, [emailInput]);

  const checkServerSmtpStatus = async () => {
    setSmtpChecking(true);
    setSmtpError('');
    try {
      const response = await fetch('/api/smtp-status');
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const data = await response.json();
      setServerSmtp(data);
    } catch (err) {
      console.error(err);
      setSmtpError('Could not fetch backend configuration status. Ensure the backend server is running.');
    } finally {
      setSmtpChecking(false);
    }
  };

  const fetchCampaignHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.error('History fetch error:', err);
      setHistoryError('Failed to fetch campaign dispatch history logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteCampaignRecord = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign log?')) return;
    
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setCampaigns(prev => prev.filter(c => c._id !== id));
        if (selectedCampaign && selectedCampaign._id === id) {
          setSelectedCampaign(null);
        }
      } else {
        alert(`Deletion error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      alert('Network error while deleting campaign.');
    }
  };

  const handleCustomSmtpChange = (field, val) => {
    setCustomSmtp(prev => ({ ...prev, [field]: val }));
  };

  const appendLog = (text, type = '') => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      text,
      type
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleExcelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(file);
  };

  const parseExcelFile = (file) => {
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to 2D array of rows
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rows.length === 0) {
          alert('The Excel file is empty!');
          return;
        }

        // Auto-detect email and name columns
        const headerRow = rows[0] || [];
        let emailColIdx = -1;
        let nameColIdx = -1;

        // 1. Scan header text for common matches
        for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
          const val = String(headerRow[colIdx] || '').trim().toLowerCase();
          if (val.includes('email') || val.includes('mail') || val === 'to') {
            emailColIdx = colIdx;
          } else if (val.includes('name') || val.includes('client') || val.includes('customer') || val.includes('recipient') || val.includes('person') || val.includes('contact')) {
            if (nameColIdx === -1 || val === 'name' || val === 'full name') {
              nameColIdx = colIdx;
            }
          }
        }

        // 2. Scan values for @ symbol if header detection failed
        if (emailColIdx === -1) {
          const scanRowsCount = Math.min(rows.length, 10);
          const colCounts = {};
          for (let r = 0; r < scanRowsCount; r++) {
            const row = rows[r] || [];
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c] || '').trim();
              if (cellVal.includes('@') && cellVal.includes('.')) {
                colCounts[c] = (colCounts[c] || 0) + 1;
              }
            }
          }
          let maxCount = 0;
          for (const c in colCounts) {
            if (colCounts[c] > maxCount) {
              maxCount = colCounts[c];
              emailColIdx = parseInt(c);
            }
          }
        }

        // 3. Fallback name column
        if (nameColIdx === -1) {
          for (let c = 0; c < headerRow.length; c++) {
            if (c !== emailColIdx) {
              nameColIdx = c;
              break;
            }
          }
        }

        if (emailColIdx === -1) {
          alert('Could not find an email column in the spreadsheet. Please ensure the sheet contains email addresses.');
          setExcelFileName('');
          return;
        }

        const parsedContacts = [];
        const isHeaderEmail = String(headerRow[emailColIdx] || '').includes('@');
        const startRow = isHeaderEmail ? 0 : 1;

        for (let r = startRow; r < rows.length; r++) {
          const row = rows[r] || [];
          const email = String(row[emailColIdx] || '').trim();
          
          if (email && email.includes('@')) {
            let name = nameColIdx !== -1 ? String(row[nameColIdx] || '').trim() : '';
            if (!name) {
              name = email.split('@')[0];
            }
            parsedContacts.push({
              name,
              email,
              checked: true
            });
          }
        }

        if (parsedContacts.length === 0) {
          alert('No valid contacts/emails found in the uploaded file!');
          setExcelFileName('');
          return;
        }

        setExcelContacts(parsedContacts);
        appendLog(`Successfully loaded ${parsedContacts.length} contacts from Excel file "${file.name}"`, 'success');
      } catch (err) {
        console.error(err);
        alert(`Failed to parse Excel file: ${err.message}`);
        setExcelFileName('');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveExcelFile = () => {
    setExcelContacts([]);
    setExcelFileName('');
    setExcelSearchQuery('');
    appendLog('Removed Excel contact spreadsheet import', 'info');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isSending) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSending) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        parseExcelFile(file);
      } else {
        alert('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      }
    }
  };

  const toggleContactCheck = (email) => {
    setExcelContacts(prev => prev.map(c => 
      c.email === email ? { ...c, checked: !c.checked } : c
    ));
  };

  const setAllContactsCheck = (checkedState) => {
    setExcelContacts(prev => prev.map(c => ({ ...c, checked: checkedState })));
  };

  // Filtered contacts based on search query
  const filteredContacts = excelContacts.filter(c => 
    c.name.toLowerCase().includes(excelSearchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(excelSearchQuery.toLowerCase())
  );

  const startSendingCampaign = async () => {
    const recipients = importTab === 'excel'
      ? excelContacts.filter(c => c.checked).map(c => c.email)
      : parsedEmails;

    if (recipients.length === 0) {
      if (importTab === 'excel') {
        alert('Please select at least one recipient checkbox to send emails!');
      } else {
        alert('Please enter at least one valid recipient email address!');
      }
      return;
    }

    // Set UI states for sending
    setIsSending(true);
    setProgressPercent(0);
    setProgressText('Initializing campaign sending...');
    setStats({
      total: recipients.length,
      sent: 0,
      success: 0,
      error: 0
    });

    // Populate initial recipients status table
    const initialRecipients = recipients.map(email => ({
      email,
      status: 'pending',
      message: 'Waiting in queue...'
    }));
    setRecipientsStatus(initialRecipients);

    setLogs([]);
    appendLog(`Starting campaign send process for ${recipients.length} recipients...`, 'info');

    // Build configuration override if Custom mode is selected
    let smtpConfig = null;
    if (smtpMode === 'custom') {
      smtpConfig = {
        host: customSmtp.host,
        port: customSmtp.port,
        secure: customSmtp.secure,
        user: customSmtp.user,
        pass: customSmtp.pass,
        fromName: customSmtp.fromName,
        fromEmail: customSmtp.fromEmail,
      };
    }

    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails: recipients, smtpConfig })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      // Read SSE stream chunks
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      let successCount = 0;
      let errorCount = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split buffer by SSE boundaries
        const lines = buffer.split('\n\n');
        // Keep last incomplete chunk in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.substring(6);
            try {
              const data = JSON.parse(rawData);

              if (data.error) {
                appendLog(`Error: ${data.error}`, 'error');
                setProgressText('Process aborted.');
                setIsSending(false);
                fetchCampaignHistory(); // Refresh history
                return;
              }

              if (data.message) {
                appendLog(data.message, data.mock ? 'info' : '');
              }

              if (data.status === 'sending') {
                setStats(prev => ({ ...prev, sent: data.index }));
                setProgressText(`Sending: ${data.index} of ${data.total}`);
                
                setRecipientsStatus(prev => prev.map(rec => 
                  rec.email === data.email 
                    ? { ...rec, status: 'sending', message: data.message || 'Sending email...' } 
                    : rec
                ));
              } else if (data.status === 'success') {
                successCount++;
                setStats(prev => ({ ...prev, success: successCount }));
                appendLog(`Success to ${data.email}`, 'success');

                setRecipientsStatus(prev => prev.map(rec => 
                  rec.email === data.email 
                    ? { ...rec, status: 'success', message: data.message || 'Delivered successfully' } 
                    : rec
                ));

                const percent = Math.round((data.index / data.total) * 100);
                setProgressPercent(percent);
              } else if (data.status === 'error') {
                errorCount++;
                setStats(prev => ({ ...prev, error: errorCount }));
                appendLog(`Failed to ${data.email}: ${data.message}`, 'error');

                setRecipientsStatus(prev => prev.map(rec => 
                  rec.email === data.email 
                    ? { ...rec, status: 'error', message: data.message || 'Delivery error' } 
                    : rec
                ));

                const percent = Math.round((data.index / data.total) * 100);
                setProgressPercent(percent);
              }

              if (data.done) {
                appendLog(`Campaign dispatch finished! Success: ${successCount}, Failures: ${errorCount}`, 'info');
                setProgressText('Completed.');
                setIsSending(false);
                fetchCampaignHistory(); // Refresh history
              }
            } catch (err) {
              console.error('Failed to parse SSE JSON block:', err);
            }
          }
        }
      }
    } catch (err) {
      appendLog(`Network dispatch error: ${err.message}`, 'error');
      setProgressText('Network error occurred.');
      setIsSending(false);
      fetchCampaignHistory(); // Refresh history
    }
  };

  return (
    <div className="app-container">
      {/* Premium Left Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-text">Crimson</div>
          <div className="subtitle">Bulk Email Sender</div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            Campaign Dispatcher
          </div>
          <div 
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            SMTP Settings
          </div>
          <div 
            className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              fetchCampaignHistory();
            }}
          >
            <History size={18} />
            Sent Campaigns
          </div>
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

      {/* Main Dashboard Space */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div>
            <header>
              <h1>Campaign Advertisement Dashboard</h1>
            </header>

            <div className="grid two-column-grid">
              {/* Left Column: Email Client Preview Mockup */}
              <div className="card email-preview-card">
                <div className="card-title">
                  <Mail size={18} />
                  Email Campaign Preview
                </div>

                <div className="email-client-mockup">
                  <div className="email-header-fields">
                    <div className="email-header-line">
                      <span className="email-header-label">From:</span>
                      <span className="email-header-value">
                        <strong>{smtpMode === 'custom' && customSmtp.fromName ? customSmtp.fromName : 'Crimson Group LLP'}</strong> &lt;{smtpMode === 'custom' && customSmtp.fromEmail ? customSmtp.fromEmail : 'crimsongroupllp@gmail.com'}&gt;
                      </span>
                    </div>
                    <div className="email-header-line">
                      <span className="email-header-label">To:</span>
                      <span className="email-header-value italic-value">
                        {importTab === 'excel' 
                          ? `${excelContacts.filter(c => c.checked).length} selected contacts (e.g. ${excelContacts.filter(c => c.checked)[0]?.name || 'recipient'}@domain.com)`
                          : parsedEmails.length > 0 
                            ? `${parsedEmails.length} recipient(s) (e.g. ${parsedEmails[0]})`
                            : 'Recipient List (None loaded)'}
                      </span>
                    </div>
                    <div className="email-header-line">
                      <span className="email-header-label">Subject:</span>
                      <span className="email-header-value subject-value">🎁 Celebrate Onam with Crimson Corporate Gift Combos</span>
                    </div>
                    <div className="email-header-line">
                      <span className="email-header-label">Attachment:</span>
                      <span className="email-header-value attachment-value">
                        <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        onam_flyer.jpg (390 KB)
                      </span>
                    </div>
                  </div>

                  <div className="email-body-content">
                    <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E5E0D8' }}>
                      <div className="flyer-preview-frame" style={{ maxWidth: '100%', margin: '0 auto' }}>
                        <img src="/onam_flyer.jpg" alt="Onam Gift Combo Flyer" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
                      </div>
                      
                      <div style={{ marginTop: '20px', padding: '10px 0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#990F02', display: 'block', marginBottom: '4px' }}>
                          Ready to Place an Order?
                        </span>
                        <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#666666', display: 'block', marginBottom: '10px' }}>
                          We can design your branding also, it feels like your product
                        </span>
                        <div style={{ display: 'inline-block', backgroundColor: '#25D366', color: '#FFFFFF', fontWeight: 'bold', fontSize: '12px', padding: '8px 16px', borderRadius: '20px' }}>
                          Order / Inquire on WhatsApp
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recipient queue setup */}
              <div className="card recipient-setup-card">
                <div className="card-title">
                  <Users size={18} />
                  Recipient Campaign Setup
                </div>

                {/* Import Tabs */}
                <div className="import-tabs">
                  <button 
                    type="button"
                    className={`import-tab-btn ${importTab === 'manual' ? 'active' : ''}`}
                    onClick={() => !isSending && setImportTab('manual')}
                  >
                    <Mail size={14} />
                    Manual Paste
                  </button>
                  <button 
                    type="button"
                    className={`import-tab-btn ${importTab === 'excel' ? 'active' : ''}`}
                    onClick={() => !isSending && setImportTab('excel')}
                  >
                    <FileSpreadsheet size={14} />
                    Excel Spreadsheet
                  </button>
                </div>

                {importTab === 'manual' && (
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label htmlFor="email-list" style={{ margin: '0' }}>Recipient Emails ({parsedEmails.length} loaded)</label>
                      {jsonFormatType === 'json' && (
                        <span className={`json-status ${jsonStatus.valid ? 'valid' : 'invalid'}`}>
                          {jsonStatus.message}
                        </span>
                      )}
                    </div>
                    <textarea 
                      id="email-list" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={'Enter emails (comma separated or JSON array format)\n\nExample:\ncustomer1@gmail.com, customer2@gmail.com\n\nOr:\n["client1@company.com", "client2@company.com"]'}
                      disabled={isSending}
                    />
                  </div>
                )}

                {importTab === 'excel' && (
                  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    {/* Drag and Drop Zone */}
                    {!excelFileName ? (
                      <div 
                        className={`excel-upload-zone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Upload size={32} className="excel-upload-icon" />
                        <p>Drag and drop your spreadsheet here, or <strong>browse</strong></p>
                        <span>Supports .xlsx, .xls, .csv files</span>
                        <input 
                          type="file" 
                          accept=".xlsx, .xls, .csv" 
                          className="excel-upload-input"
                          onChange={handleExcelFileUpload}
                          disabled={isSending}
                        />
                      </div>
                    ) : (
                      /* File Loaded Info */
                      <div>
                        <div className="file-info-box">
                          <div className="file-info-details">
                            <FileSpreadsheet size={20} style={{ color: 'var(--secondary)' }} />
                            <div>
                              <div className="file-name">{excelFileName}</div>
                              <div className="file-meta">
                                {excelContacts.length} contacts found
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className="btn-remove-file"
                            onClick={handleRemoveExcelFile}
                            disabled={isSending}
                            title="Remove file"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Search & Actions */}
                        {excelContacts.length > 0 && (
                          <>
                            <div className="excel-search-wrapper">
                              <Search size={14} className="excel-search-icon" />
                              <input 
                                type="text"
                                className="excel-search-input"
                                placeholder="Search by name or email..."
                                value={excelSearchQuery}
                                onChange={(e) => setExcelSearchQuery(e.target.value)}
                                disabled={isSending}
                              />
                            </div>

                            <div className="selection-actions-row">
                              <span className="selection-counts">
                                {excelContacts.filter(c => c.checked).length} of {excelContacts.length} selected
                              </span>
                              <div className="selection-links">
                                <button 
                                  type="button" 
                                  className="action-link-btn"
                                  onClick={() => setAllContactsCheck(true)}
                                  disabled={isSending}
                                >
                                  Select All
                                </button>
                                <span style={{ color: 'var(--border)' }}>|</span>
                                <button 
                                  type="button" 
                                  className="action-link-btn"
                                  onClick={() => setAllContactsCheck(false)}
                                  disabled={isSending}
                                >
                                  Deselect All
                                </button>
                              </div>
                            </div>

                            {/* Scrollable checklist */}
                            <div className="excel-contacts-wrapper">
                              <table className="excel-contacts-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                      <input 
                                        type="checkbox"
                                        className="contact-row-checkbox"
                                        checked={excelContacts.length > 0 && excelContacts.every(c => c.checked)}
                                        onChange={(e) => setAllContactsCheck(e.target.checked)}
                                        disabled={isSending}
                                      />
                                    </th>
                                    <th>Name</th>
                                    <th>Email</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredContacts.length === 0 ? (
                                    <tr>
                                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                        No matching contacts found.
                                      </td>
                                    </tr>
                                  ) : (
                                    filteredContacts.map((contact) => (
                                      <tr 
                                        key={contact.email} 
                                        className={contact.checked ? 'selected' : ''}
                                        onClick={() => !isSending && toggleContactCheck(contact.email)}
                                        style={{ cursor: isSending ? 'default' : 'pointer' }}
                                      >
                                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                          <input 
                                            type="checkbox"
                                            className="contact-row-checkbox"
                                            checked={contact.checked}
                                            onChange={() => toggleContactCheck(contact.email)}
                                            disabled={isSending}
                                          />
                                        </td>
                                        <td className="contact-name-cell">{contact.name}</td>
                                        <td className="contact-email-cell">{contact.email}</td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  className="btn-submit" 
                  onClick={startSendingCampaign}
                  disabled={
                    isSending || 
                    (importTab === 'manual' && parsedEmails.length === 0) ||
                    (importTab === 'excel' && excelContacts.filter(c => c.checked).length === 0)
                  }
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Dispatching Campaign Queue...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Dispatch Bulk Emails
                    </>
                  )}
                </button>
              </div>

              {/* Full-width Progress & Transmission Logs */}
              <div className="card progress-section">
                <div className="card-title">
                  <TrendingUp size={18} />
                  Transmission Progress Dashboard
                </div>

                <div className="progress-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSending && <Loader2 size={14} className="spin" style={{ color: 'var(--info)' }} />}
                    {progressText}
                  </span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{progressPercent}%</span>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-val">{stats.total}</div>
                    <div className="stat-lbl">Queue Total</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-val" style={{ color: isSending ? 'var(--info)' : 'var(--text-primary)' }}>
                      {stats.sent}
                    </div>
                    <div className="stat-lbl">Processed</div>
                  </div>
                  <div className="stat-card" style={{ boxShadow: stats.success > 0 ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none' }}>
                    <div className="stat-val" style={{ color: 'var(--success)' }}>{stats.success}</div>
                    <div className="stat-lbl">Success</div>
                  </div>
                  <div className="stat-card" style={{ boxShadow: stats.error > 0 ? '0 0 10px rgba(239, 68, 68, 0.1)' : 'none' }}>
                    <div className="stat-val" style={{ color: 'var(--error)' }}>{stats.error}</div>
                    <div className="stat-lbl">Failed</div>
                  </div>
                </div>

                {/* Activity Log console */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div className="log-header-container">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0' }}>
                      <Terminal size={14} />
                      Activity Log
                    </label>
                    {logs.length > 0 && (
                      <button className="log-clear-btn" onClick={clearLogs} disabled={isSending}>
                        <Trash2 size={11} /> Clear Logs
                      </button>
                    )}
                  </div>
                  <div className="log-container">
                    {logs.map((log, index) => (
                      <div key={index} className={`log-entry ${log.type}`}>
                        <span className="log-time">[{log.time}]</span>
                        <span className="log-content">{log.text}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>

                {/* Recipients Live Status Table */}
                {recipientsStatus.length > 0 && (
                  <div className="recipients-list-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div className="recipients-header">
                      <Users size={16} />
                      Recipient Dispatch Status
                    </div>
                    <div className="recipients-table-wrapper">
                      <table className="recipients-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Recipient Address</th>
                            <th>Delivery Status</th>
                            <th>Server Response / Status Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipientsStatus.map((item, index) => (
                            <tr key={index}>
                              <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                              <td style={{ fontWeight: '500' }}>{item.email}</td>
                              <td>
                                <span className={`badge ${item.status}`}>
                                  {item.status === 'sending' && <Loader2 size={10} className="spin" />}
                                  {item.status === 'success' && <CheckCircle2 size={10} />}
                                  {item.status === 'error' && <XCircle size={10} />}
                                  {item.status}
                                </span>
                              </td>
                              <td style={{ 
                                color: item.status === 'success' ? 'var(--success)' : item.status === 'error' ? 'var(--error)' : 'var(--text-secondary)',
                                fontSize: '12px'
                              }}>
                                {item.message}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SMTP Server Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <header>
              <h1>SMTP Settings Profile</h1>
            </header>

            <div className="card">
              <div className="card-title">
                <Settings size={18} />
                SMTP Server Configuration
              </div>

              <div className="mode-select">
                <div 
                  className={`mode-btn ${smtpMode === 'env' ? 'active' : ''}`}
                  onClick={() => !isSending && setSmtpMode('env')}
                >
                  Use Server .env
                </div>
                <div 
                  className={`mode-btn ${smtpMode === 'custom' ? 'active' : ''}`}
                  onClick={() => !isSending && setSmtpMode('custom')}
                >
                  Custom SMTP
                </div>
              </div>

              {/* Server SMTP Status Check */}
              {smtpMode === 'env' && (
                <div>
                  {smtpChecking ? (
                    <div className="info-box mock-smtp" style={{ justifyContent: 'center' }}>
                      <Loader2 size={16} className="spin" />
                      Checking server configurations...
                    </div>
                  ) : smtpError ? (
                    <div className="info-box error-smtp">
                      <ShieldAlert size={18} />
                      <div>
                        <strong>Status Connection Issue</strong>
                        <p style={{ fontSize: '11px', marginTop: '4px' }}>{smtpError}</p>
                      </div>
                    </div>
                  ) : serverSmtp.configured ? (
                    <div className="info-box active-smtp">
                      <ShieldCheck size={18} />
                      <div>
                        <strong>Active Server SMTP Configured</strong>
                        <p style={{ fontSize: '11px', marginTop: '4px' }}>
                          <strong>Host:</strong> {serverSmtp.smtpHost}:{serverSmtp.smtpPort}<br/>
                          <strong>Username:</strong> {serverSmtp.smtpUser}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="info-box mock-smtp">
                      <ShieldAlert size={18} />
                      <div>
                        <strong>Server .env Inactive / Missing</strong>
                        <p style={{ fontSize: '11px', marginTop: '4px' }}>
                          System will operate in <strong>Simulation (Mock) Mode</strong>. 
                          Switch to "Custom SMTP" to use physical server overrides.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom SMTP Config Form */}
              {smtpMode === 'custom' && (
                <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <div className="form-group">
                    <label>SMTP Host</label>
                    <input 
                      type="text" 
                      value={customSmtp.host}
                      onChange={(e) => handleCustomSmtpChange('host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      disabled={isSending}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Port</label>
                      <input 
                        type="number" 
                        value={customSmtp.port}
                        onChange={(e) => handleCustomSmtpChange('port', e.target.value)}
                        placeholder="587"
                        disabled={isSending}
                      />
                    </div>
                    <div className="form-group checkbox-group" style={{ height: '100%', display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                      <input 
                        type="checkbox" 
                        id="smtp-secure"
                        checked={customSmtp.secure}
                        onChange={(e) => handleCustomSmtpChange('secure', e.target.checked)}
                        disabled={isSending}
                      />
                      <label htmlFor="smtp-secure" style={{ display: 'inline', margin: '0', cursor: 'pointer' }}>SSL/TLS (465)</label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Username (Email)</label>
                    <input 
                      type="text" 
                      value={customSmtp.user}
                      onChange={(e) => handleCustomSmtpChange('user', e.target.value)}
                      placeholder="your-email@gmail.com"
                      disabled={isSending}
                    />
                  </div>

                  <div className="form-group">
                    <label>Password (App Password)</label>
                    <input 
                      type="password" 
                      value={customSmtp.pass}
                      onChange={(e) => handleCustomSmtpChange('pass', e.target.value)}
                      placeholder="your-app-password"
                      disabled={isSending}
                    />
                  </div>

                  <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                    <label>From Display Name</label>
                    <input 
                      type="text" 
                      value={customSmtp.fromName}
                      onChange={(e) => handleCustomSmtpChange('fromName', e.target.value)}
                      disabled={isSending}
                    />
                  </div>

                  <div className="form-group">
                    <label>From Email Address</label>
                    <input 
                      type="text" 
                      value={customSmtp.fromEmail}
                      onChange={(e) => handleCustomSmtpChange('fromEmail', e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campaign Sent Mail History Tab */}
        {activeTab === 'history' && (
          <div>
            <header className="history-header">
              <h1>Campaign Dispatch History</h1>
              <button 
                className="btn-icon-label" 
                onClick={fetchCampaignHistory} 
                disabled={loadingHistory}
              >
                <RefreshCw size={14} className={loadingHistory ? 'spin' : ''} />
                Refresh Logs
              </button>
            </header>

            {loadingHistory && campaigns.length === 0 ? (
              <div className="empty-state" style={{ borderStyle: 'solid' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--secondary)' }} />
                <p>Loading history records...</p>
              </div>
            ) : historyError ? (
              <div className="empty-state" style={{ borderStyle: 'solid', borderColor: 'var(--error)' }}>
                <ShieldAlert size={32} style={{ color: 'var(--error)' }} />
                <p style={{ color: 'var(--error)' }}>{historyError}</p>
                <button className="btn-secondary" onClick={fetchCampaignHistory}>Try Again</button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <History size={24} />
                </div>
                <h3>No Campaigns Found</h3>
                <p>You haven't sent any email campaigns yet. Go to the dispatcher tab to run your first bulk campaign!</p>
                <button className="btn-submit" style={{ maxWidth: '200px' }} onClick={() => setActiveTab('dashboard')}>
                  Create a Campaign
                </button>
              </div>
            ) : (
              <div className="history-grid">
                {campaigns.map((camp) => {
                  const successRate = camp.totalEmails > 0 
                    ? Math.round((camp.successCount / camp.totalEmails) * 100) 
                    : 0;

                  const formattedDate = new Date(camp.sentAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const formattedTime = new Date(camp.sentAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={camp._id} className="history-card">
                      <div className="history-card-header">
                        <div>
                          <div className="history-subject">{camp.subject}</div>
                          <span className={`badge ${camp.status}`} style={{ marginTop: '8px' }}>
                            {camp.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {formattedDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Clock size={12} /> {formattedTime}</span>
                        </div>
                      </div>

                      <div className="history-meta">
                        <div className="history-meta-item">
                          <Users size={14} />
                          <span><strong>{camp.totalEmails}</strong> Recipients</span>
                        </div>
                        <div className="history-meta-item">
                          <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                          <span style={{ color: 'var(--success)' }}><strong>{camp.successCount}</strong> Delivered</span>
                        </div>
                        <div className="history-meta-item">
                          <XCircle size={14} style={{ color: 'var(--error)' }} />
                          <span style={{ color: 'var(--error)' }}><strong>{camp.errorCount}</strong> Failed</span>
                        </div>
                        <div className="history-meta-item">
                          <Server size={14} />
                          <span><strong>SMTP:</strong> {camp.smtpHost} ({camp.smtpUser})</span>
                        </div>
                      </div>

                      {/* Pill Progress Gauge */}
                      <div className="stacked-progress-container">
                        <div className="stacked-bar">
                          <div 
                            className="stacked-segment success" 
                            style={{ width: `${(camp.successCount / camp.totalEmails) * 100}%` }}
                          />
                          <div 
                            className="stacked-segment error" 
                            style={{ width: `${(camp.errorCount / camp.totalEmails) * 100}%` }}
                          />
                          <div 
                            className="stacked-segment pending" 
                            style={{ width: `${((camp.totalEmails - camp.successCount - camp.errorCount) / camp.totalEmails) * 100}%` }}
                          />
                        </div>
                        <div className="stacked-labels">
                          <span>Delivery Success Rate: {successRate}%</span>
                          <span>ID: {camp._id}</span>
                        </div>
                      </div>

                      <div className="history-actions">
                        <button 
                          className="btn-secondary" 
                          onClick={() => {
                            setSelectedCampaign(camp);
                            setModalTab('recipients');
                          }}
                        >
                          <FileText size={13} />
                          View Detailed Logs
                        </button>
                        <button 
                          className="btn-danger-outline"
                          onClick={() => deleteCampaignRecord(camp._id)}
                        >
                          <Trash2 size={13} />
                          Delete Log
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Campaign Details Modal overlay */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold' }}>
                  {selectedCampaign.subject}
                </h2>
                <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span><strong>Date:</strong> {new Date(selectedCampaign.sentAt).toLocaleString()}</span>
                  <span><strong>SMTP:</strong> {selectedCampaign.smtpHost}</span>
                  <span><strong>Total Loaded:</strong> {selectedCampaign.totalEmails}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCampaign(null)}>
                <XCircle size={22} />
              </button>
            </div>

            <div className="modal-body">
              {/* Tabs */}
              <div className="modal-tabs">
                <button 
                  className={`modal-tab-btn ${modalTab === 'recipients' ? 'active' : ''}`}
                  onClick={() => setModalTab('recipients')}
                >
                  <Users size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  Recipients List ({selectedCampaign.recipients.length})
                </button>
                <button 
                  className={`modal-tab-btn ${modalTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setModalTab('logs')}
                >
                  <Terminal size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  Archived Activity Log ({selectedCampaign.logs.length})
                </button>
              </div>

              {/* Tab 1: Recipients list */}
              {modalTab === 'recipients' && (
                <div className="recipients-table-wrapper" style={{ maxHeight: '350px' }}>
                  <table className="recipients-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Email Address</th>
                        <th>Status</th>
                        <th>Server Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaign.recipients.map((rec, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ fontWeight: '500' }}>{rec.email}</td>
                          <td>
                            <span className={`badge ${rec.status}`}>
                              {rec.status === 'success' && <CheckCircle2 size={10} />}
                              {rec.status === 'error' && <XCircle size={10} />}
                              {rec.status}
                            </span>
                          </td>
                          <td style={{ 
                            color: rec.status === 'success' ? 'var(--success)' : rec.status === 'error' ? 'var(--error)' : 'var(--text-secondary)',
                            fontSize: '12px'
                          }}>
                            {rec.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Activity logs */}
              {modalTab === 'logs' && (
                <div className="log-container" style={{ height: '350px' }}>
                  {selectedCampaign.logs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '100px' }}>
                      No terminal logs were archived for this campaign.
                    </div>
                  ) : (
                    selectedCampaign.logs.map((log, i) => {
                      const timeString = log.timestamp 
                        ? new Date(log.timestamp).toLocaleTimeString() 
                        : 'Log';
                      return (
                        <div key={i} className={`log-entry ${log.type}`}>
                          <span className="log-time">[{timeString}]</span>
                          <span className="log-content">{log.text}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
