import React, { useState } from 'react';
import { Users, User, Settings, Calendar, Database, Trash2, FileText, ChevronDown, ChevronUp, Plus, FileSpreadsheet } from 'lucide-react';
import { useProposal } from '../context/ProposalContext';

export default function ProposalForm() {
  const {
    sender,
    setSender,
    recipient,
    setRecipient,
    meta,
    setMeta,
    sections,
    handleAddSection,
    handleRemoveSection,
    handleSectionChange
  } = useProposal();

  const [isOpen, setIsOpen] = useState({
    sender: true,
    recipient: false,
    meta: false,
    sections: false
  });

  const toggleSection = (section) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="invoice-form-section">
      {/* Sender Details Form */}
      <div className="card" style={{ paddingBottom: isOpen.sender ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('sender')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.sender ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.sender ? '12px' : '0',
            marginBottom: isOpen.sender ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            Sender Information (From)
          </span>
          {isOpen.sender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.sender && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Company Name</label>
              <input
                type="text"
                value={sender.company}
                onChange={(e) => setSender({ ...sender, company: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Address</label>
              <input
                type="text"
                value={sender.address}
                onChange={(e) => setSender({ ...sender, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={sender.email}
                onChange={(e) => setSender({ ...sender, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={sender.phone}
                onChange={(e) => setSender({ ...sender, phone: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recipient Details Form */}
      <div className="card" style={{ paddingBottom: isOpen.recipient ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('recipient')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.recipient ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.recipient ? '12px' : '0',
            marginBottom: isOpen.recipient ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} />
            Recipient Information (To)
          </span>
          {isOpen.recipient ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.recipient && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="form-group">
              <label>Recipient Name</label>
              <input
                type="text"
                value={recipient.name}
                onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Recipient Title / Position</label>
              <input
                type="text"
                value={recipient.title}
                onChange={(e) => setRecipient({ ...recipient, title: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Company Name</label>
              <input
                type="text"
                value={recipient.company}
                onChange={(e) => setRecipient({ ...recipient, company: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Address</label>
              <input
                type="text"
                value={recipient.address}
                onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Proposal Metadata Form */}
      <div className="card" style={{ paddingBottom: isOpen.meta ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('meta')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.meta ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.meta ? '12px' : '0',
            marginBottom: isOpen.meta ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Proposal Details
          </span>
          {isOpen.meta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.meta && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="form-group">
              <label>Proposal ID</label>
              <input
                type="text"
                value={meta.proposalId}
                onChange={(e) => setMeta({ ...meta, proposalId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Proposal Date</label>
              <input
                type="date"
                value={meta.date}
                onChange={(e) => setMeta({ ...meta, date: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Subject</label>
              <input
                type="text"
                value={meta.subject}
                onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Salutation</label>
              <input
                type="text"
                value={meta.salutation}
                onChange={(e) => setMeta({ ...meta, salutation: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Introduction & Background Paragraphs</label>
              <textarea
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  padding: '10px',
                  width: '100%',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                value={meta.intro}
                onChange={(e) => setMeta({ ...meta, intro: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Proposal Sections */}
      <div className="card" style={{ paddingBottom: isOpen.sections ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('sections')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.sections ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.sections ? '12px' : '0',
            marginBottom: isOpen.sections ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} />
            Proposal Content Sections
          </span>
          {isOpen.sections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.sections && (
          <div style={{ marginTop: '15px', animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sections.map((section, idx) => (
              <div
                key={section.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Section #{idx + 1}
                  </span>
                  <button
                    type="button"
                    className="btn-delete-item-row"
                    onClick={() => handleRemoveSection(section.id)}
                    title="Delete Section"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label>Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Section Content</label>
                  <textarea
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      padding: '10px',
                      width: '100%',
                      minHeight: '120px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button type="button" className="btn-add-item-row" onClick={handleAddSection}>
              <Plus size={14} />
              Add Custom Content Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
