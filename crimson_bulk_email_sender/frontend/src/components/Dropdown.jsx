import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';

export default function Dropdown({
  label,
  placeholder = 'Select an option...',
  options = [],
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  loading = false,
  searchable = true,
  clearable = false,
  emptyMessage = 'No results found',
  searchFields = [],
  customRender,
  style,
  selectStyle
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to a standard format: { value, label, raw }
  const normalizedOptions = useMemo(() => {
    return (options || []).map((opt) => {
      if (opt === null || opt === undefined) return null;
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: opt, label: String(opt), raw: opt };
      }
      
      // Auto-detect value field
      let val = opt.value;
      if (val === undefined) val = opt.id;
      if (val === undefined) val = opt._id;
      if (val === undefined) val = opt;

      // Auto-detect label field
      let lbl = opt.label;
      if (lbl === undefined) lbl = opt.name;
      if (lbl === undefined) lbl = opt.username;
      if (lbl === undefined) lbl = opt.title;
      if (lbl === undefined) lbl = opt.category;
      if (lbl === undefined) lbl = String(opt);

      return { value: val, label: lbl, raw: opt };
    }).filter(Boolean);
  }, [options]);

  // Find currently selected normalized option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find(opt => opt.value === value) || null;
  }, [normalizedOptions, value]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase();

    return normalizedOptions.filter(opt => {
      // Check main label safely
      if (opt.label && String(opt.label).toLowerCase().includes(term)) return true;

      // Check searchFields if provided
      if (searchFields && searchFields.length > 0 && typeof opt.raw === 'object') {
        return searchFields.some(field => {
          const val = opt.raw[field];
          return val && String(val).toLowerCase().includes(term);
        });
      }

      // Fallback: check all fields in the raw object
      if (typeof opt.raw === 'object') {
        return Object.values(opt.raw).some(val => 
          val && (typeof val === 'string' || typeof val === 'number') && String(val).toLowerCase().includes(term)
        );
      }

      return false;
    });
  }, [normalizedOptions, searchTerm, searchFields]);

  // Handle dropdown opening/focus/highlight actions when isOpen changes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    } else {
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      
      // Set highlighted index to selected item or first item initially on open
      const selectedIdx = normalizedOptions.findIndex(opt => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const selected = filteredOptions[highlightedIndex];
          onChange(selected.value, selected.raw);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (opt) => {
    onChange(opt.value, opt.raw);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
  };

  // Scroll active/highlighted item into view
  const listRef = useRef(null);
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const activeEl = listRef.current.childNodes[highlightedIndex];
      if (activeEl) {
        const listEl = listRef.current;
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.offsetHeight;
        const listHeight = listEl.clientHeight;
        const listScroll = listEl.scrollTop;

        if (activeTop < listScroll) {
          listEl.scrollTop = activeTop;
        } else if (activeTop + activeHeight > listScroll + listHeight) {
          listEl.scrollTop = activeTop + activeHeight - listHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div 
      ref={containerRef} 
      className="custom-dropdown-container" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        width: '100%',
        position: 'relative',
        ...style 
      }}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: error ? 'var(--error)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {label}
          {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: disabled ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
          border: `1px solid ${error ? 'var(--error)' : isOpen ? 'var(--border-focus)' : 'var(--border)'}`,
          borderRadius: '8px',
          padding: '8px 12px',
          color: disabled ? 'var(--text-muted)' : selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '13px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(153, 15, 2, 0.15)' : 'none',
          transition: 'all 0.2s',
          height: '36px',
          boxSizing: 'border-box',
          ...selectStyle
        }}
        className={isOpen ? 'focus' : ''}
      >
        <span style={{ 
          textOverflow: 'ellipsis', 
          overflow: 'hidden', 
          whiteSpace: 'nowrap',
          flexGrow: 1,
          textAlign: 'left'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {clearable && selectedOption && !disabled && (
            <button
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
          
          {loading ? (
            <Loader2 size={14} className="spin" style={{ color: 'var(--text-muted)' }} />
          ) : isOpen ? (
            <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <span style={{ 
          color: 'var(--error)', 
          fontSize: '11px', 
          marginTop: '2px' 
        }}>
          {error}
        </span>
      )}

      {/* Dropdown Menu Option List */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: label ? 'calc(100% + 4px)' : 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'rgba(26, 24, 21, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          {/* Search Box */}
          {searchable && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '6px 10px'
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div
            ref={listRef}
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '2px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <Loader2 size={20} className="spin" style={{ color: 'var(--secondary)' }} />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div style={{ 
                padding: '12px 10px', 
                color: 'var(--text-muted)', 
                fontSize: '12px', 
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = value === opt.value;
                const isHighlighted = idx === highlightedIndex;
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      background: isSelected 
                        ? 'var(--primary)' 
                        : isHighlighted 
                        ? 'rgba(255, 199, 44, 0.1)' 
                        : 'transparent',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    {customRender ? (
                      customRender(opt.raw)
                    ) : (
                      <span>{opt.label}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
