import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function CustomConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(13, 12, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: 'rgba(26, 24, 21, 0.98)',
        border: '1px solid rgba(255, 199, 44, 0.25)',
        borderRadius: '16px',
        padding: '24px 30px',
        maxWidth: '440px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(153, 15, 2, 0.2)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(153, 15, 2, 0.15)',
            color: '#FFC72C',
            borderRadius: '50%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F5F2EB', letterSpacing: '0.5px' }}>
            {title || 'Confirm Action'}
          </h3>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#B5AFA5',
          lineHeight: '1.6',
          margin: '0 0 24px 0',
          fontWeight: '500'
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(229, 224, 216, 0.08)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: '#F5F2EB',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(229, 224, 216, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.03)';
              e.target.style.borderColor = 'rgba(229, 224, 216, 0.08)';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #990F02, #C21807)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(153, 15, 2, 0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(153, 15, 2, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'none';
              e.target.style.boxShadow = '0 4px 12px rgba(153, 15, 2, 0.35)';
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
