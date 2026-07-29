import React, { useState } from 'react';
import { Users, Mail, FileSpreadsheet, Trash2, Upload, Search, Send, Loader2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export default function RecipientSetup() {
  const {
    importTab,
    setImportTab,
    isSending,
    singleEmailInput,
    setSingleEmailInput,
    handleAddManualEmail,
    parsedEmails,
    handleClearAllManualEmails,
    handleRemoveManualEmail,
    excelFileName,
    excelContacts,
    handleRemoveExcelFile,
    excelSearchQuery,
    setExcelSearchQuery,
    setAllContactsCheck,
    toggleContactCheck,
    parseExcelFile,
    startSendingCampaign
  } = useCampaign();

  const [isDragging, setIsDragging] = useState(false);

  const handleExcelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(file);
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

  const filteredContacts = excelContacts.filter(c =>
    c.name.toLowerCase().includes(excelSearchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(excelSearchQuery.toLowerCase())
  );

  const selectedExcelCount = excelContacts.filter(c => c.checked).length;

  return (
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
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="form-group">
            <label htmlFor="manual-email-field">Add Recipient Emails</label>
            <div className="manual-input-wrapper">
              <input
                type="text"
                id="manual-email-field"
                className="manual-email-input"
                placeholder="Enter email (or paste comma-separated list)..."
                value={singleEmailInput}
                onChange={(e) => setSingleEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualEmail();
                  }
                }}
                disabled={isSending}
              />
              <button
                type="button"
                className="btn-add-email"
                onClick={handleAddManualEmail}
                disabled={isSending || !singleEmailInput.trim()}
              >
                Add
              </button>
            </div>
          </div>

          <div className="manual-list-header">
            <span className="manual-list-title">
              Recipient List ({parsedEmails.length} loaded)
            </span>
            {parsedEmails.length > 0 && (
              <button
                type="button"
                className="btn-clear-manual"
                onClick={handleClearAllManualEmails}
                disabled={isSending}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="manual-email-list">
            {parsedEmails.length === 0 ? (
              <div className="manual-email-empty">
                <Mail size={24} style={{ color: 'var(--text-muted)' }} />
                <div>No emails in manual queue.</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Type above and click Add or press Enter to build your list.
                </span>
              </div>
            ) : (
              parsedEmails.map((email) => (
                <div key={email} className="manual-email-item">
                  <span className="manual-email-text">{email}</span>
                  <button
                    type="button"
                    className="btn-remove-manual-item"
                    onClick={() => handleRemoveManualEmail(email)}
                    disabled={isSending}
                    title={`Remove ${email}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
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
                      {selectedExcelCount} of {excelContacts.length} selected
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
          (importTab === 'excel' && selectedExcelCount === 0)
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
  );
}
