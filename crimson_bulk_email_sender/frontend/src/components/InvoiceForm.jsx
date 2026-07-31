import React, { useState } from 'react';
import { Users, Settings, Calendar, Database, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';

export default function InvoiceForm() {
  const {
    customerDetails,
    setCustomerDetails,
    sellerDetails,
    setSellerDetails,
    invoiceMeta,
    setInvoiceMeta,
    invoiceItems,
    setInvoiceItems,
    handleAddInvoiceItem,
    handleRemoveInvoiceItem,
    handleInvoiceItemChange,
    termsAndConditions,
    handleTermChange,
    handleAddTerm,
    handleRemoveTerm,
    allowEditSeller,
    allowEditTerms,
    handleToggleEditSeller,
    handleToggleEditTerms,
    gstEnabled,
    setGstEnabled,
    showGstin,
    setShowGstin,
    masterProducts
  } = useInvoice();

  const [isOpen, setIsOpen] = useState({
    customer: false,
    seller: false,
    meta: false,
    items: false,
    terms: false
  });

  const toggleSection = (section) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="invoice-form-section">
      {/* Customer Details Form */}
      <div className="card" style={{ paddingBottom: isOpen.customer ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('customer')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.customer ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.customer ? '12px' : '0',
            marginBottom: isOpen.customer ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} />
            Customer Details
          </span>
          {isOpen.customer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isOpen.customer && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="form-group">
              <label>Customer/Client Name</label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Attn / Contact Person</label>
              <input
                type="text"
                value={customerDetails.attn}
                onChange={(e) => setCustomerDetails({ ...customerDetails, attn: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Destination / Address</label>
              <input
                type="text"
                value={customerDetails.destination}
                onChange={(e) => setCustomerDetails({ ...customerDetails, destination: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Seller Details Form */}
      <div className="card" style={{ paddingBottom: isOpen.seller ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('seller')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.seller ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.seller ? '12px' : '0',
            marginBottom: isOpen.seller ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} />
            Seller Details
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: showGstin ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${showGstin ? 'var(--primary-light)' : 'var(--border)'}`,
                background: showGstin ? 'rgba(153,15,2,0.12)' : 'transparent',
                transition: 'all 0.2s ease',
                marginRight: '8px'
              }}
            >
              <input
                type="checkbox"
                checked={showGstin}
                onChange={(e) => setShowGstin(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '13px', height: '13px' }}
              />
              Show GSTIN
            </label>
            {isOpen.seller ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {isOpen.seller && (
          <div style={{ marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            {/* Allow Custom Edit Radio Buttons */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Allow custom seller editing?
              </span>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', letterSpacing: 'normal', margin: '0', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <input
                    type="radio"
                    name="allowEditSeller"
                    checked={allowEditSeller === true}
                    onChange={() => handleToggleEditSeller(true)}
                    style={{ cursor: 'pointer' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', letterSpacing: 'normal', margin: '0', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <input
                    type="radio"
                    name="allowEditSeller"
                    checked={allowEditSeller === false}
                    onChange={() => handleToggleEditSeller(false)}
                    style={{ cursor: 'pointer' }}
                  />
                  No
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', opacity: allowEditSeller ? 1 : 0.8 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Company Name</label>
                <input
                  type="text"
                  value={sellerDetails.name}
                  onChange={(e) => setSellerDetails({ ...sellerDetails, name: e.target.value })}
                  disabled={!allowEditSeller}
                  style={{ cursor: allowEditSeller ? 'text' : 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Office Address</label>
                <textarea
                  rows="2"
                  value={sellerDetails.office}
                  onChange={(e) => setSellerDetails({ ...sellerDetails, office: e.target.value })}
                  disabled={!allowEditSeller}
                  style={{ cursor: allowEditSeller ? 'text' : 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label>GSTIN</label>
                <input
                  type="text"
                  value={sellerDetails.gstin}
                  onChange={(e) => setSellerDetails({ ...sellerDetails, gstin: e.target.value })}
                  disabled={!allowEditSeller}
                  style={{ cursor: allowEditSeller ? 'text' : 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={sellerDetails.phone}
                  onChange={(e) => setSellerDetails({ ...sellerDetails, phone: e.target.value })}
                  disabled={!allowEditSeller}
                  style={{ cursor: allowEditSeller ? 'text' : 'not-allowed' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Email</label>
                <input
                  type="text"
                  value={sellerDetails.email}
                  onChange={(e) => setSellerDetails({ ...sellerDetails, email: e.target.value })}
                  disabled={!allowEditSeller}
                  style={{ cursor: allowEditSeller ? 'text' : 'not-allowed' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quotation Meta Info Form */}
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
            <Calendar size={16} />
            Quotation Meta Details
          </span>
          {isOpen.meta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.meta && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div className="form-group">
              <label>Quotation Number</label>
              <input
                type="text"
                value={invoiceMeta.quoteNo}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, quoteNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Quotation Date</label>
              <input
                type="date"
                value={invoiceMeta.date}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Prepared By</label>
              <input
                type="text"
                value={invoiceMeta.preparedBy}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, preparedBy: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Items/Products Form */}
      <div className="card" style={{ paddingBottom: isOpen.items ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('items')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.items ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.items ? '12px' : '0',
            marginBottom: isOpen.items ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} />
            Product Items List
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: gstEnabled ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${gstEnabled ? 'var(--primary-light)' : 'var(--border)'}`,
                background: gstEnabled ? 'rgba(153,15,2,0.12)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '13px', height: '13px' }}
              />
              GST
            </label>
            {isOpen.items ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {isOpen.items && (
          <div style={{ marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="invoice-form-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '25%' }}>Size</th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '10%' }}>Price/pc</th>
                    <th style={{ width: '10%' }}>GST%</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {masterProducts && masterProducts.length > 0 && (
                          <select
                            className="invoice-form-item-input"
                            style={{ marginBottom: '8px', fontSize: '11px', padding: '4px 6px', height: 'auto', background: 'rgba(0,0,0,0.15)', cursor: 'pointer' }}
                            value={masterProducts.find(p => p.description === item.description && p.size === item.size)?.id || ""}
                            onChange={(e) => {
                              const prodId = e.target.value;
                              if (prodId) {
                                const selected = masterProducts.find(p => p.id === parseInt(prodId));
                                if (selected) {
                                  setInvoiceItems(prev => prev.map(invItem => {
                                    if (invItem.id === item.id) {
                                      return {
                                        ...invItem,
                                        description: selected.description,
                                        size: selected.size,
                                        price: selected.price,
                                        gstRate: selected.gstRate
                                      };
                                    }
                                    return invItem;
                                  }));
                                }
                              }
                            }}
                          >
                            <option value="">-- Pick from Product List --</option>
                            {masterProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.description} {p.size ? `(${p.size})` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        <textarea
                          className="invoice-form-item-input"
                          rows="2"
                          placeholder="Product description & specifications"
                          value={item.description}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <textarea
                          className="invoice-form-item-input"
                          rows="2"
                          placeholder="Dimensions"
                          value={item.size}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'size', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="invoice-form-item-input"
                          value={item.qty}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          className="invoice-form-item-input"
                          value={item.price}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'price', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="invoice-form-item-input"
                          value={item.gstRate}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'gstRate', e.target.value)}
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete-item-row"
                          onClick={() => handleRemoveInvoiceItem(item.id)}
                          title="Delete row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn-add-item-row" onClick={handleAddInvoiceItem} style={{ marginTop: '10px' }}>
              + Add New Product Row
            </button>
          </div>
        )}
      </div>

      {/* Terms and Conditions Form */}
      <div className="card" style={{ paddingBottom: isOpen.terms ? '30px' : '20px' }}>
        <div
          className="card-title"
          onClick={() => toggleSection('terms')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none',
            borderBottom: isOpen.terms ? '1px solid var(--border)' : 'none',
            paddingBottom: isOpen.terms ? '12px' : '0',
            marginBottom: isOpen.terms ? '24px' : '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Terms & Conditions
          </span>
          {isOpen.terms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isOpen.terms && (
          <div style={{ marginTop: '15px', animation: 'fadeIn 0.2s ease-out' }}>
            {/* Allow Custom Edit Radio Buttons */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Allow custom terms editing?
              </span>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', letterSpacing: 'normal', margin: '0', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <input
                    type="radio"
                    name="allowEditTerms"
                    checked={allowEditTerms === true}
                    onChange={() => handleToggleEditTerms(true)}
                    style={{ cursor: 'pointer' }}
                  />
                  Yes
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', letterSpacing: 'normal', margin: '0', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <input
                    type="radio"
                    name="allowEditTerms"
                    checked={allowEditTerms === false}
                    onChange={() => handleToggleEditTerms(false)}
                    style={{ cursor: 'pointer' }}
                  />
                  No
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: allowEditTerms ? 1 : 0.8 }}>
              {termsAndConditions.map((term, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{index + 1}.</span>
                  <input
                    type="text"
                    className="invoice-form-item-input"
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    disabled={!allowEditTerms}
                    style={{ cursor: allowEditTerms ? 'text' : 'not-allowed' }}
                  />
                  <button
                    type="button"
                    className="btn-delete-item-row"
                    onClick={() => handleRemoveTerm(index)}
                    disabled={!allowEditTerms}
                    title="Remove Term"
                    style={{
                      opacity: allowEditTerms ? 1 : 0.4,
                      cursor: allowEditTerms ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add-item-row"
                onClick={handleAddTerm}
                disabled={!allowEditTerms}
                style={{
                  borderStyle: 'solid',
                  marginTop: '5px',
                  opacity: allowEditTerms ? 1 : 0.4,
                  cursor: allowEditTerms ? 'pointer' : 'not-allowed'
                }}
              >
                + Add Term Statement
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
