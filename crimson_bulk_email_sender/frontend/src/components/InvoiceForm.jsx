import React, { useState } from 'react';
import { Users, Settings, Calendar, Database, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import { useCrm } from '../context/CrmContext';
import Dropdown from './Dropdown';
import SalutationDropdown from './SalutationDropdown';

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
    showTotal,
    setShowTotal,
    masterProducts
  } = useInvoice();

  const crm = useCrm();
  const leads = crm?.leads || [];
  const fetchLeads = crm?.fetchLeads;
  const safeLeads = (leads || []).filter(Boolean);

  React.useEffect(() => {
    if (fetchLeads) {
      fetchLeads({ limit: 100 }).catch(err => console.warn('Failed to fetch leads for invoice selector:', err));
    }
  }, []);

  const handleLoadFromLead = (leadId) => {
    if (!leadId) return;
    const lead = safeLeads.find(l => l._id === leadId);
    if (lead) {
      // 1. Populate Customer details
      setCustomerDetails({
        name: lead.company || lead.name || '',
        attnSalutation: lead.salutation || '',
        attn: lead.name || '',
        phone: lead.phone || '',
        destination: lead.address || ''
      });

      // 2. Populate Quotation products list if present
      if (lead.quotation?.products && lead.quotation.products.length > 0) {
        const mappedItems = lead.quotation.products.map((p, idx) => {
          const matchedProd = masterProducts?.find(mp => mp.description === p.name);
          return {
            id: idx + 1,
            description: p.name || '',
            size: matchedProd ? matchedProd.size : '',
            qty: p.quantity || 1,
            price: p.unitPrice || 0,
            gstRate: p.tax || 18
          };
        });
        setInvoiceItems(mappedItems);

        // Auto-enable GST if any items have a tax percentage
        const hasTax = lead.quotation.products.some(p => p.tax > 0);
        if (hasTax) {
          setGstEnabled(true);
        }
      }
    }
  };

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
            <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '5px' }}>
              <label style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                <Database size={12} />
                Auto-fill from CRM Lead
              </label>
              <Dropdown
                placeholder="-- Choose a Lead to import details --"
                options={safeLeads.map(l => ({ value: l._id, label: `${l.name} ${l.company ? `(${l.company})` : ''}` }))}
                onChange={handleLoadFromLead}
                searchable={true}
                selectStyle={{
                  background: 'rgba(255, 199, 44, 0.05)',
                  border: '1px dashed var(--secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

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
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '120px', flexShrink: 0 }}>
                  <SalutationDropdown
                    value={customerDetails.attnSalutation}
                    onChange={(val) => setCustomerDetails({ ...customerDetails, attnSalutation: val })}
                  />
                </div>
                <div style={{ flexGrow: 1 }}>
                  <input
                    type="text"
                    value={customerDetails.attn}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, attn: e.target.value })}
                  />
                </div>
              </div>
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
                color: showTotal ? 'var(--primary-light)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                border: `1px solid ${showTotal ? 'var(--primary-light)' : 'var(--border)'}`,
                background: showTotal ? 'rgba(153,15,2,0.12)' : 'transparent',
                transition: 'all 0.2s ease',
                marginRight: '4px'
              }}
            >
              <input
                type="checkbox"
                checked={showTotal}
                onChange={(e) => setShowTotal(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '13px', height: '13px' }}
              />
              Total
            </label>
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
                    <th style={{ width: '50%' }}>Description</th>
                    <th style={{ width: '15%' }}>Size</th>
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
                        {item.image && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <img
                              src={item.image}
                              alt="thumbnail"
                              style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Variant Image Linked</span>
                          </div>
                        )}
                        {masterProducts && masterProducts.length > 0 && (
                          <Dropdown
                            placeholder="-- Pick from Product List --"
                            options={masterProducts.map(p => ({
                              value: p.id,
                              label: `${p.description} ${p.size ? `(${p.size})` : ''}`
                            }))}
                            value={masterProducts.find(p => p.description === item.description && p.size === item.size)?.id || ""}
                            onChange={(prodId) => {
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
                                        gstRate: selected.gstRate,
                                        image: selected.image || ''
                                      };
                                    }
                                    return invItem;
                                  }));
                                }
                              }
                            }}
                            searchable={true}
                            style={{ marginBottom: '6px' }}
                            selectStyle={{
                              fontSize: '11px',
                              height: '28px',
                              padding: '2px 8px',
                              background: 'rgba(255, 199, 44, 0.06)',
                              border: '1px solid rgba(255, 199, 44, 0.2)',
                              color: 'var(--secondary)',
                              fontWeight: '600'
                            }}
                          />
                        )}
                        <textarea
                          className="invoice-form-item-input"
                          rows="1"
                          placeholder="Product description & specifications"
                          value={item.description}
                          onChange={(e) => handleInvoiceItemChange(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="invoice-form-item-input"
                          placeholder="Size/Dimensions"
                          value={item.size || ''}
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
                        <Dropdown
                          options={[
                            { value: 0, label: '0%' },
                            { value: 5, label: '5%' },
                            { value: 12, label: '12%' },
                            { value: 18, label: '18%' },
                            { value: 28, label: '28%' }
                          ]}
                          value={item.gstRate}
                          onChange={(val) => handleInvoiceItemChange(item.id, 'gstRate', Number(val))}
                          searchable={false}
                          selectStyle={{
                            height: '28px',
                            fontSize: '11px',
                            padding: '2px 8px'
                          }}
                        />
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
            {/* <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
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
            </div> */}

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
