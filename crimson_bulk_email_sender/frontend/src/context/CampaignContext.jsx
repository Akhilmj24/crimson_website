import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

const CampaignContext = createContext();

export function useCampaign() {
  return useContext(CampaignContext);
}

export function CampaignProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
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
    fromName: 'Crimson Eats LLP',
    fromEmail: 'crimsoneatsllp@gmail.com'
  });

  // Email queue input state
  const [singleEmailInput, setSingleEmailInput] = useState('');
  const [parsedEmails, setParsedEmails] = useState([]);

  // Excel Recipient Import States
  const [importTab, setImportTab] = useState('manual'); // 'manual' or 'excel'
  const [excelContacts, setExcelContacts] = useState([]); // Array of { name, email, checked }
  const [excelSearchQuery, setExcelSearchQuery] = useState('');
  const [excelFileName, setExcelFileName] = useState('');

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

  const logContainerRef = useRef(null);

  // Auto-scroll logs container internally
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Check server SMTP & database settings on mount
  useEffect(() => {
    checkServerSmtpStatus();
    fetchCampaignHistory();
  }, []);

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

  // Handlers for manual email list management
  const handleAddManualEmail = () => {
    const trimmed = singleEmailInput.trim();
    if (!trimmed) return;

    let emails = [];

    // Check if it looks like a JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          emails = parsed
            .map(e => String(e).trim())
            .filter(e => e.length > 0 && e.includes('@'));
        }
      } catch (err) {
        // Fall back to separator parsing
      }
    }

    if (emails.length === 0) {
      // Split by commas, semicolons, whitespace, or newlines
      emails = trimmed
        .split(/[,\s;\n]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'));
    }

    if (emails.length === 0) {
      alert('Please enter at least one valid email address containing "@"!');
      return;
    }

    // Filter duplicates
    const newEmails = emails.filter(email => !parsedEmails.includes(email));

    if (newEmails.length === 0) {
      alert('The email(s) you are trying to add are already in the list.');
      setSingleEmailInput('');
      return;
    }

    setParsedEmails(prev => [...prev, ...newEmails]);
    setSingleEmailInput('');
    appendLog(`Manually added ${newEmails.length} recipient email(s) to queue.`, 'info');
  };

  const handleRemoveManualEmail = (emailToRemove) => {
    setParsedEmails(prev => prev.filter(email => email !== emailToRemove));
    appendLog(`Removed manual email: ${emailToRemove}`, 'info');
  };

  const handleClearAllManualEmails = () => {
    if (parsedEmails.length === 0) return;
    if (window.confirm('Are you sure you want to clear all manually entered emails?')) {
      setParsedEmails([]);
      appendLog('Cleared all manually entered emails.', 'info');
    }
  };

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

  const toggleContactCheck = (email) => {
    setExcelContacts(prev => prev.map(c =>
      c.email === email ? { ...c, checked: !c.checked } : c
    ));
  };

  const setAllContactsCheck = (checkedState) => {
    setExcelContacts(prev => prev.map(c => ({ ...c, checked: checkedState })));
  };

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
    <CampaignContext.Provider value={{
      activeTab,
      setActiveTab,
      smtpMode,
      setSmtpMode,
      serverSmtp,
      smtpChecking,
      smtpError,
      customSmtp,
      singleEmailInput,
      setSingleEmailInput,
      parsedEmails,
      setParsedEmails,
      importTab,
      setImportTab,
      excelContacts,
      setExcelContacts,
      excelSearchQuery,
      setExcelSearchQuery,
      excelFileName,
      isSending,
      progressText,
      progressPercent,
      stats,
      logs,
      recipientsStatus,
      campaigns,
      loadingHistory,
      historyError,
      selectedCampaign,
      setSelectedCampaign,
      modalTab,
      setModalTab,
      logContainerRef,
      appendLog,
      clearLogs,
      handleAddManualEmail,
      handleRemoveManualEmail,
      handleClearAllManualEmails,
      checkServerSmtpStatus,
      fetchCampaignHistory,
      deleteCampaignRecord,
      handleCustomSmtpChange,
      parseExcelFile,
      handleRemoveExcelFile,
      toggleContactCheck,
      setAllContactsCheck,
      startSendingCampaign
    }}>
      {children}
    </CampaignContext.Provider>
  );
}
