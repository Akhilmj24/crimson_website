import React, { createContext, useContext, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCampaign } from './CampaignContext';
import { product, terms } from './data';

const InvoiceContext = createContext();

export function useInvoice() {
  return useContext(InvoiceContext);
}

export function InvoiceProvider({ children }) {
  const { appendLog } = useCampaign();

  const [invoiceMeta, setInvoiceMeta] = useState({
    quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000),
    date: (() => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    })(),
    preparedBy: 'Akhil'
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: 'Crimson Snacks',
    attn: 'Mr. Akhil',
    phone: '+91 7907160645',
    destination: 'South India'
  });

  const [sellerDetails, setSellerDetails] = useState({
    name: 'Crimson Group LLP',
    office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
    gstin: '06ADMTEST',
    phone: '+91 99467 99457',
    email: 'crimsongroupllp@gmail.com'
  });

  // const [invoiceItems, setInvoiceItems] = useState([
  //   {
  //     id: 1,
  //     description: 'Digital Printed Stand Up Pouch with Zipper\nFinish: Matte Metalised\nLayers: 18μ MATTE BOPP / 12μ METPET / 80μ PE',
  //     size: 'Medium\nWidth(mm): 130 • Height(mm): 210 • Gusset(mm): 80',
  //     qty: 2000,
  //     price: 14.20,
  //     gstRate: 18
  //   },
  //   {
  //     id: 2,
  //     description: 'Digital Printed Stand Up Pouch with Zipper\nFinish: Matte Metalised\nLayers: 18μ MATTE BOPP / 12μ METPET / 90μ PE',
  //     size: 'Large\nWidth(mm): 160 • Height(mm): 230 • Gusset(mm): 90',
  //     qty: 2000,
  //     price: 15.30,
  //     gstRate: 18
  //   }
  // ]);
  const [invoiceItems, setInvoiceItems] = useState(product);

  const [termsAndConditions, setTermsAndConditions] = useState(terms);

  // Edit authorization states: init as false
  const [allowEditSeller, setAllowEditSeller] = useState(false);
  const [allowEditTerms, setAllowEditTerms] = useState(false);

  // GST toggle: enabled by default
  const [gstEnabled, setGstEnabled] = useState(true);

  const handleToggleEditSeller = (val) => {
    setAllowEditSeller(val);
    if (!val) {
      // Reset to default seller details
      setSellerDetails({
        name: 'Crimson Group LLP',
        office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
        gstin: '06ADMTEST',
        phone: '+91 99467 99457',
        email: 'crimsongroupllp@gmail.com'
      });
    }
  };

  const handleToggleEditTerms = (val) => {
    setAllowEditTerms(val);
    if (!val) {
      // Reset to default terms and conditions
      setTermsAndConditions([
        'Minimum Order Quantity (MOQ): The minimum order quantity for digital printing is 2,000 pieces per variant and 5,000 pieces per variant for Flat Bottom Pouches.',
        'Product Dimensions: All dimensions mentioned in this quotation are based on our standard sizes. The buyer is requested to verify and confirm the same before placing the final order.',
        'Pricing Basis: Prices are calculated based on the number of variants and quantities communicated by the buyer. Any change in the number of variants or order quantity will result in a revised unit price.',
        'Freight & Taxes: Freight and transportation charges will be billed at actuals and are not included in the quoted price unless explicitly stated otherwise. GST @ 18% will be applicable additionally.',
        'Delivery Timeline: Estimated delivery is approximately 20 days from the date of final artwork approval and receipt of advance payment.',
        'Payment Terms: 60% advance payment is required to initiate production. The remaining balance must be cleared before dispatch, as per the Final Invoice.',
        'Production Tolerance: Final production quantities may vary by ±500 pieces or 20% of the ordered quantity, whichever is higher. The buyer agrees to accept and make payment for all quantities delivered within this tolerance range.',
        'Price Validity: All prices mentioned in this quotation are valid for 15 days from the date of issue.'
      ]);
    }
  };

  const handleAddInvoiceItem = () => {
    const nextId = invoiceItems.length > 0 ? Math.max(...invoiceItems.map(item => item.id)) + 1 : 1;
    setInvoiceItems([
      ...invoiceItems,
      {
        id: nextId,
        description: '',
        size: '',
        qty: 1000,
        price: 0.00,
        gstRate: 18
      }
    ]);
  };

  const handleRemoveInvoiceItem = (id) => {
    if (invoiceItems.length === 1) {
      alert('Invoice must have at least one item.');
      return;
    }
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const handleInvoiceItemChange = (id, field, val) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        let parsedVal = val;
        if (field === 'qty') parsedVal = parseInt(val) || 0;
        if (field === 'price') parsedVal = parseFloat(val) || 0;
        if (field === 'gstRate') parsedVal = parseFloat(val) || 0;
        return { ...item, [field]: parsedVal };
      }
      return item;
    }));
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-pdf-area');
    if (!element) return;

    try {
      // Use scrollHeight to capture only real content, ignoring CSS min-height
      const contentHeight = element.scrollHeight;
      const contentWidth = element.scrollWidth;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: contentWidth,
        height: contentHeight,
        windowWidth: contentWidth,
        windowHeight: contentHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297; // correct A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${customerDetails.name.replace(/\s+/g, '_')}_Quotation_${invoiceMeta.quoteNo}.pdf`;
      pdf.save(fileName);
      appendLog(`Successfully generated and downloaded PDF quotation: ${fileName}`, 'success');
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('Failed to generate PDF. Error: ' + err.message);
    }
  };

  const handleTermChange = (index, value) => {
    setTermsAndConditions(prev => prev.map((t, i) => i === index ? value : t));
  };

  const handleAddTerm = () => {
    setTermsAndConditions([...termsAndConditions, '']);
  };

  const handleRemoveTerm = (index) => {
    setTermsAndConditions(termsAndConditions.filter((_, i) => i !== index));
  };

  return (
    <InvoiceContext.Provider value={{
      invoiceMeta,
      setInvoiceMeta,
      customerDetails,
      setCustomerDetails,
      sellerDetails,
      setSellerDetails,
      invoiceItems,
      setInvoiceItems,
      termsAndConditions,
      setTermsAndConditions,
      allowEditSeller,
      allowEditTerms,
      handleToggleEditSeller,
      handleToggleEditTerms,
      handleAddInvoiceItem,
      handleRemoveInvoiceItem,
      handleInvoiceItemChange,
      handleDownloadPDF,
      handleTermChange,
      handleAddTerm,
      handleRemoveTerm,
      gstEnabled,
      setGstEnabled
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}
