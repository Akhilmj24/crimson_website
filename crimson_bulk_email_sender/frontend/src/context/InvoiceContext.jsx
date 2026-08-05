import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';
import { useCampaign } from './CampaignContext';
import { useProposal } from './ProposalContext';
import { product, terms } from './data';
import { invoiceService } from '../services/invoiceService';
import { productService } from '../services/productService';

const InvoiceContext = createContext();

export function useInvoice() {
  return useContext(InvoiceContext);
}

export function InvoiceProvider({ children }) {
  const { appendLog } = useCampaign();
  const proposalContext = useProposal();
  const [invoiceConfirmModal, setInvoiceConfirmModal] = useState({ isOpen: false, onConfirm: null });

  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: 'Client Company',
    attnSalutation: 'Mr.',
    attn: 'Satheesh V S',
    phone: '+91 9744050505',
    destination: 'Trivandrum, Kerala'
  });

  // Synchronize Invoice customerDetails and Proposal recipient
  const prevRecipientRef = useRef(proposalContext?.recipient);
  const prevCustomerDetailsRef = useRef(customerDetails);

  useEffect(() => {
    if (!proposalContext) return;

    const recipient = proposalContext.recipient;
    const isRecipientChanged =
      recipient.company !== prevRecipientRef.current?.company ||
      recipient.salutation !== prevRecipientRef.current?.salutation ||
      recipient.name !== prevRecipientRef.current?.name ||
      recipient.address !== prevRecipientRef.current?.address ||
      recipient.phone !== prevRecipientRef.current?.phone;

    const isCustomerDetailsChanged =
      customerDetails.name !== prevCustomerDetailsRef.current?.name ||
      customerDetails.attnSalutation !== prevCustomerDetailsRef.current?.attnSalutation ||
      customerDetails.attn !== prevCustomerDetailsRef.current?.attn ||
      customerDetails.destination !== prevCustomerDetailsRef.current?.destination ||
      customerDetails.phone !== prevCustomerDetailsRef.current?.phone;

    const companyDiff = recipient.company !== customerDetails.name;
    const salutationDiff = recipient.salutation !== customerDetails.attnSalutation;
    const nameDiff = recipient.name !== customerDetails.attn;
    const addressDiff = recipient.address !== customerDetails.destination;
    const phoneDiff = recipient.phone !== customerDetails.phone;

    if (isRecipientChanged && !isCustomerDetailsChanged) {
      if (companyDiff || salutationDiff || nameDiff || addressDiff || phoneDiff) {
        setCustomerDetails(prev => ({
          ...prev,
          name: recipient.company || '',
          attnSalutation: recipient.salutation || '',
          attn: recipient.name || '',
          destination: recipient.address || '',
          phone: recipient.phone || ''
        }));
      }
    } else if (isCustomerDetailsChanged && !isRecipientChanged) {
      if (companyDiff || salutationDiff || nameDiff || addressDiff || phoneDiff) {
        proposalContext.setRecipient(prev => ({
          ...prev,
          company: customerDetails.name || '',
          salutation: customerDetails.attnSalutation || '',
          name: customerDetails.attn || '',
          address: customerDetails.destination || '',
          phone: customerDetails.phone || ''
        }));
      }
    }

    prevRecipientRef.current = recipient;
    prevCustomerDetailsRef.current = customerDetails;
  }, [proposalContext?.recipient, customerDetails]);

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

  const [sellerDetails, setSellerDetails] = useState({
    name: 'Crimson Eats LLP',
    office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
    gstin: '06ADMTEST',
    phone: '+91 99467 99457',
    email: 'crimsoneatsllp@gmail.com'
  });

  const [invoiceItems, setInvoiceItems] = useState(product);
  const [termsAndConditions, setTermsAndConditions] = useState(terms);
  const [allowEditSeller, setAllowEditSeller] = useState(false);
  const [allowEditTerms, setAllowEditTerms] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(true);
  const [showGstin, setShowGstin] = useState(true);
  const [masterProducts, setMasterProducts] = useState(product);

  // Initialize draft: Load from DB, Migrate legacy, or create a default document
  useEffect(() => {
    const initializeInvoiceDraft = async () => {
      let fetchedProducts = [];
      try {
        fetchedProducts = await productService.getProducts();
      } catch (err) {
        console.warn('Failed to load global products from database:', err.message);
      }

      let activeId = localStorage.getItem('active_invoice_id');

      if (activeId) {
        try {
          const res = await invoiceService.getInvoice(activeId);
          if (res) {
            setCustomerDetails(res.customerDetails || {});
            setSellerDetails(res.sellerDetails || {});

            const loadedItems = res.items || [];
            const hasOldProducts = loadedItems.some(item =>
              item.description === 'Kerala Banana Chips' ||
              item.description === 'Sharkara Upperi'
            );
            setInvoiceItems(hasOldProducts || loadedItems.length === 0 ? product : loadedItems);

            setTermsAndConditions(res.terms && res.terms.length > 0 ? res.terms : terms);
            const loadedMeta = res.meta || {};
            setInvoiceMeta({
              quoteNo: loadedMeta.quoteNo || '',
              date: loadedMeta.date || '',
              preparedBy: loadedMeta.preparedBy || (localStorage.getItem('crm_user_name') || localStorage.getItem('crm_user_id') || 'Akhil')
            });
            setGstEnabled(res.gstEnabled !== undefined ? res.gstEnabled : true);
            setShowGstin(res.showGstin !== undefined ? res.showGstin : true);

            if (fetchedProducts && fetchedProducts.length > 0) {
              setMasterProducts(fetchedProducts);
            } else {
              const loadedMaster = res.masterProducts || [];
              const hasOldMaster = loadedMaster.some(item =>
                item.description === 'Kerala Banana Chips' ||
                item.description === 'Sharkara Upperi'
              );
              setMasterProducts(hasOldMaster || loadedMaster.length === 0 ? product : loadedMaster);
            }

            setActiveInvoiceId(activeId);
            return;
          }
        } catch (err) {
          console.warn('Failed to load active invoice from MongoDB, resetting active ID', err.message);
          localStorage.removeItem('active_invoice_id');
          activeId = null;
        }
      }

      // Check for legacy localStorage data
      const hasLegacyData = localStorage.getItem('invoice_customerDetails') ||
        localStorage.getItem('invoice_meta') ||
        localStorage.getItem('invoice_items');

      if (hasLegacyData) {
        try {
          const legacyPayload = {
            customerDetails: localStorage.getItem('invoice_customerDetails') ? JSON.parse(localStorage.getItem('invoice_customerDetails')) : {
              name: 'Client Company',
              attn: 'Mr Satheesh V S',
              phone: '+91 9744050505',
              destination: 'Trivandrum, Kerala'
            },
            meta: localStorage.getItem('invoice_meta') ? JSON.parse(localStorage.getItem('invoice_meta')) : {
              quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000),
              date: new Date().toISOString().split('T')[0],
              preparedBy: localStorage.getItem('crm_user_name') || localStorage.getItem('crm_user_id') || 'Akhil'
            },
            sellerDetails: localStorage.getItem('invoice_sellerDetails') ? JSON.parse(localStorage.getItem('invoice_sellerDetails')) : {
              name: 'Crimson Eats LLP',
              office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
              gstin: '06ADMTEST',
              phone: '+91 99467 99457',
              email: 'crimsoneatsllp@gmail.com'
            },
            items: localStorage.getItem('invoice_items') ? JSON.parse(localStorage.getItem('invoice_items')) : product,
            terms: localStorage.getItem('invoice_terms') ? JSON.parse(localStorage.getItem('invoice_terms')) : terms,
            gstEnabled: localStorage.getItem('invoice_gstEnabled') ? JSON.parse(localStorage.getItem('invoice_gstEnabled')) : true,
            showGstin: localStorage.getItem('invoice_showGstin') ? JSON.parse(localStorage.getItem('invoice_showGstin')) : true,
            masterProducts: localStorage.getItem('invoice_masterProducts') ? JSON.parse(localStorage.getItem('invoice_masterProducts')) : product
          };

          const newInvoice = await invoiceService.createInvoice(legacyPayload);
          localStorage.setItem('active_invoice_id', newInvoice._id);
          setActiveInvoiceId(newInvoice._id);
          setCustomerDetails(newInvoice.customerDetails || {});
          setSellerDetails(newInvoice.sellerDetails || {});

          const loadedItems = newInvoice.items || [];
          const hasOldProducts = loadedItems.some(item =>
            item.description === 'Kerala Banana Chips' ||
            item.description === 'Sharkara Upperi'
          );
          setInvoiceItems(hasOldProducts || loadedItems.length === 0 ? product : loadedItems);

          setTermsAndConditions(newInvoice.terms && newInvoice.terms.length > 0 ? newInvoice.terms : terms);
          setInvoiceMeta(newInvoice.meta || {});
          setGstEnabled(newInvoice.gstEnabled !== undefined ? newInvoice.gstEnabled : true);
          setShowGstin(newInvoice.showGstin !== undefined ? newInvoice.showGstin : true);

          if (fetchedProducts && fetchedProducts.length > 0) {
            setMasterProducts(fetchedProducts);
          } else {
            const loadedMaster = newInvoice.masterProducts || [];
            const hasOldMaster = loadedMaster.some(item =>
              item.description === 'Kerala Banana Chips' ||
              item.description === 'Sharkara Upperi'
            );
            setMasterProducts(hasOldMaster || loadedMaster.length === 0 ? product : loadedMaster);
          }

          // Safe clean legacy keys after successful migration save
          localStorage.removeItem('invoice_customerDetails');
          localStorage.removeItem('invoice_meta');
          localStorage.removeItem('invoice_sellerDetails');
          localStorage.removeItem('invoice_items');
          localStorage.removeItem('invoice_terms');
          localStorage.removeItem('invoice_gstEnabled');
          localStorage.removeItem('invoice_showGstin');
          localStorage.removeItem('invoice_masterProducts');
          return;
        } catch (err) {
          console.error('Migration of legacy invoice data to MongoDB failed:', err.message);
        }
      }

      // No active draft or legacy data, query MongoDB list
      try {
        const invoices = await invoiceService.getInvoices();
        if (invoices && invoices.length > 0) {
          const latest = invoices[0];
          localStorage.setItem('active_invoice_id', latest._id);
          setActiveInvoiceId(latest._id);
          setCustomerDetails(latest.customerDetails || {});
          setSellerDetails(latest.sellerDetails || {});

          const loadedItems = latest.items || [];
          const hasOldProducts = loadedItems.some(item =>
            item.description === 'Kerala Banana Chips' ||
            item.description === 'Sharkara Upperi'
          );
          setInvoiceItems(hasOldProducts || loadedItems.length === 0 ? product : loadedItems);

          setTermsAndConditions(latest.terms && latest.terms.length > 0 ? latest.terms : terms);
          const loadedMeta = latest.meta || {};
          setInvoiceMeta({
            quoteNo: loadedMeta.quoteNo || '',
            date: loadedMeta.date || '',
            preparedBy: loadedMeta.preparedBy || (localStorage.getItem('crm_user_name') || localStorage.getItem('crm_user_id') || 'Akhil')
          });
          setGstEnabled(latest.gstEnabled !== undefined ? latest.gstEnabled : true);
          setShowGstin(latest.showGstin !== undefined ? latest.showGstin : true);

          if (fetchedProducts && fetchedProducts.length > 0) {
            setMasterProducts(fetchedProducts);
          } else {
            const loadedMaster = latest.masterProducts || [];
            const hasOldMaster = loadedMaster.some(item =>
              item.description === 'Kerala Banana Chips' ||
              item.description === 'Sharkara Upperi'
            );
            setMasterProducts(hasOldMaster || loadedMaster.length === 0 ? product : loadedMaster);
          }
        } else {
          // Empty DB, create initial default document
          const newInvoice = await invoiceService.createInvoice({
            customerDetails: {
              name: 'Client Company',
              attn: 'Mr Satheesh V S',
              phone: '+91 9744050505',
              destination: 'Trivandrum, Kerala'
            },
            meta: {
              quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000),
              date: new Date().toISOString().split('T')[0],
              preparedBy: localStorage.getItem('crm_user_name') || localStorage.getItem('crm_user_id') || 'Akhil'
            },
            sellerDetails: {
              name: 'Crimson Eats LLP',
              office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
              gstin: '06ADMTEST',
              phone: '+91 99467 99457',
              email: 'crimsoneatsllp@gmail.com'
            },
            items: product,
            terms: terms,
            gstEnabled: true,
            showGstin: true,
            masterProducts: product
          });
          localStorage.setItem('active_invoice_id', newInvoice._id);
          setActiveInvoiceId(newInvoice._id);
          setCustomerDetails(newInvoice.customerDetails || {});
          setSellerDetails(newInvoice.sellerDetails || {});
          setInvoiceItems(newInvoice.items && newInvoice.items.length > 0 ? newInvoice.items : product);
          setTermsAndConditions(newInvoice.terms && newInvoice.terms.length > 0 ? newInvoice.terms : terms);
          setInvoiceMeta(newInvoice.meta || {});
          setGstEnabled(newInvoice.gstEnabled !== undefined ? newInvoice.gstEnabled : true);
          setShowGstin(newInvoice.showGstin !== undefined ? newInvoice.showGstin : true);

          if (fetchedProducts && fetchedProducts.length > 0) {
            setMasterProducts(fetchedProducts);
          } else {
            setMasterProducts(newInvoice.masterProducts && newInvoice.masterProducts.length > 0 ? newInvoice.masterProducts : product);
          }
        }
      } catch (err) {
        console.error('Initialization invoice draft error:', err.message);
      }
    };

    initializeInvoiceDraft();
  }, []);

  // Debounced auto-save to MongoDB
  useEffect(() => {
    if (!activeInvoiceId) return;

    const timer = setTimeout(async () => {
      try {
        await invoiceService.updateInvoice(activeInvoiceId, {
          customerDetails,
          sellerDetails,
          items: invoiceItems,
          terms: termsAndConditions,
          meta: invoiceMeta,
          gstEnabled,
          showGstin,
          masterProducts
        });
      } catch (err) {
        console.error('Invoice draft autosave failed:', err.message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [customerDetails, sellerDetails, invoiceItems, termsAndConditions, invoiceMeta, gstEnabled, showGstin, masterProducts, activeInvoiceId]);

  const handleToggleEditSeller = (val) => {
    setAllowEditSeller(val);
    if (!val) {
      // Reset to default seller details
      setSellerDetails({
        name: 'Crimson Eats LLP',
        office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
        gstin: '06ADMTEST',
        phone: '+91 99467 99457',
        email: 'crimsoneatsllp@gmail.com'
      });
    }
  };

  const handleToggleEditTerms = (val) => {
    setAllowEditTerms(val);
    if (!val) {
      // Reset to default terms and conditions
      setTermsAndConditions([

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
    setInvoiceItems(prev => prev.map(item => {
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

  const loadInvoiceData = (data) => {
    if (!data) return;
    if (data.customerDetails) setCustomerDetails(data.customerDetails);
    if (data.sellerDetails) setSellerDetails(data.sellerDetails);
    if (data.invoiceMeta) setInvoiceMeta(data.invoiceMeta);
    if (data.invoiceItems) setInvoiceItems(data.invoiceItems);
    if (data.termsAndConditions) setTermsAndConditions(data.termsAndConditions);
    if (data.gstEnabled !== undefined) setGstEnabled(data.gstEnabled);
    if (data.showGstin !== undefined) setShowGstin(data.showGstin);
  };

  const handleDownloadPDF = async (options = { skipPrompt: false }) => {
    const element = document.getElementById('invoice-pdf-area');
    if (!element) return;

    try {
      // Use scrollHeight to capture only real content, ignoring CSS min-height
      const contentHeight = element.scrollHeight;
      const contentWidth = element.scrollWidth;

      const canvas = await html2canvas(element, {
        scale: 4,
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

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate width and height to fit on exactly one A4 page while maintaining aspect ratio
      let imgWidth = pageWidth;
      let imgHeight = (canvasHeight * imgWidth) / canvasWidth;

      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = (canvasWidth * imgHeight) / canvasHeight;
      }

      // Center the image on the page
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      const fileName = `${customerDetails.name.replace(/\s+/g, '_')}_Quotation_${invoiceMeta.quoteNo}.pdf`;
      pdf.save(fileName);
      appendLog(`Successfully generated and downloaded PDF quotation: ${fileName}`, 'success');

      // Save to document history
      try {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'invoice',
            clientName: customerDetails.name || 'Client',
            documentId: invoiceMeta.quoteNo,
            invoiceData: { customerDetails, sellerDetails, invoiceMeta, invoiceItems, termsAndConditions, gstEnabled, showGstin }
          })
        });
      } catch (historyErr) {
        console.error('Failed to log document history:', historyErr);
      }

      // Prompt to change serial number
      if (!options?.skipPrompt) {
        setTimeout(() => {
          setInvoiceConfirmModal({
            isOpen: true,
            onConfirm: () => {
              setInvoiceMeta(prev => ({
                ...prev,
                quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000)
              }));
            }
          });
        }, 500);
      }
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('Failed to generate PDF. Error: ' + err.message);
    }
  };

  const handleDownloadCombinedPDF = async (options = { skipPrompt: false }) => {
    const proposalElement = document.getElementById('proposal-pdf-area');
    const invoiceElement = document.getElementById('invoice-pdf-area');

    if (!proposalElement || !invoiceElement) {
      alert('Error: Both Proposal and Invoice preview elements must be loaded.');
      return;
    }

    try {
      appendLog('Generating combined PDF (Proposal + Invoice)...', 'info');

      // Capture Proposal Canvas
      const proposalHeight = proposalElement.scrollHeight;
      const proposalWidth = proposalElement.scrollWidth;
      const proposalCanvas = await html2canvas(proposalElement, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: proposalWidth,
        height: proposalHeight,
        windowWidth: proposalWidth,
        windowHeight: proposalHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });
      const proposalImgData = proposalCanvas.toDataURL('image/png');

      // Capture Invoice Canvas
      const invoiceHeight = invoiceElement.scrollHeight;
      const invoiceWidth = invoiceElement.scrollWidth;
      const invoiceCanvas = await html2canvas(invoiceElement, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceWidth,
        height: invoiceHeight,
        windowWidth: invoiceWidth,
        windowHeight: invoiceHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });
      const invoiceImgData = invoiceCanvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      // --- PAGE 1: Proposal ---
      const propCanvasWidth = proposalCanvas.width;
      const propCanvasHeight = proposalCanvas.height;
      let propImgWidth = pageWidth;
      let propImgHeight = (propCanvasHeight * propImgWidth) / propCanvasWidth;
      if (propImgHeight > pageHeight) {
        propImgHeight = pageHeight;
        propImgWidth = (propCanvasWidth * propImgHeight) / propCanvasHeight;
      }
      const propXOffset = (pageWidth - propImgWidth) / 2;
      const propYOffset = (pageHeight - propImgHeight) / 2;
      pdf.addImage(proposalImgData, 'PNG', propXOffset, propYOffset, propImgWidth, propImgHeight);

      // --- PAGE 2: Invoice ---
      pdf.addPage();
      const invCanvasWidth = invoiceCanvas.width;
      const invCanvasHeight = invoiceCanvas.height;
      let invImgWidth = pageWidth;
      let invImgHeight = (invCanvasHeight * invImgWidth) / invCanvasWidth;
      if (invImgHeight > pageHeight) {
        invImgHeight = pageHeight;
        invImgWidth = (invCanvasWidth * invImgHeight) / invCanvasHeight;
      }
      const invXOffset = (pageWidth - invImgWidth) / 2;
      const invYOffset = (pageHeight - invImgHeight) / 2;
      pdf.addImage(invoiceImgData, 'PNG', invXOffset, invYOffset, invImgWidth, invImgHeight);

      // Filename
      const propRecipient = proposalContext?.recipient;
      const propMeta = proposalContext?.meta;
      const clientName = (propRecipient?.company || customerDetails?.name || 'Client').replace(/\s+/g, '_');
      const fileName = `${clientName}_Proposal_Invoice_${invoiceMeta.quoteNo || propMeta?.proposalId || 'Combo'}.pdf`;
      pdf.save(fileName);
      appendLog(`Successfully generated and downloaded combined PDF: ${fileName}`, 'success');

      // Save to document history
      try {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'both',
            clientName: propRecipient?.company || customerDetails.name || 'Client',
            documentId: `${invoiceMeta.quoteNo} / ${propMeta?.proposalId || 'Combo'}`,
            proposalData: proposalContext ? {
              sender: proposalContext.sender,
              recipient: proposalContext.recipient,
              meta: proposalContext.meta,
              sections: proposalContext.sections
            } : null,
            invoiceData: { customerDetails, sellerDetails, invoiceMeta, invoiceItems, termsAndConditions, gstEnabled, showGstin }
          })
        });
      } catch (historyErr) {
        console.error('Failed to log document history:', historyErr);
      }

      // Prompt to change serial number
      if (!options?.skipPrompt) {
        setTimeout(() => {
          const onConfirmHandler = () => {
            // Change quote number
            setInvoiceMeta(prev => ({
              ...prev,
              quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000)
            }));
            // Change proposal ID
            if (proposalContext?.setMeta) {
              proposalContext.setMeta(prev => ({
                ...prev,
                proposalId: 'SP-PR-' + Math.floor(1000 + Math.random() * 9000)
              }));
            }
          };

          setInvoiceConfirmModal({
            isOpen: true,
            onConfirm: onConfirmHandler
          });

          if (proposalContext?.setProposalConfirmModal) {
            proposalContext.setProposalConfirmModal({
              isOpen: true,
              onConfirm: onConfirmHandler
            });
          }
        }, 500);
      }
    } catch (err) {
      console.error('Combined PDF Generation error:', err);
      alert('Failed to generate combined PDF. Error: ' + err.message);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      // 1. Header Table (Logo / Title info)
      const tableHeader = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: '●', color: '990f02', size: 36 }),
                      new TextRun({ text: '● ', color: 'ffc72c', size: 36 }),
                      new TextRun({ text: 'Crimson', bold: true, size: 28, font: 'Inter', color: '990f02' }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'PROFORMA INVOICE', bold: true, color: '990f02', font: 'Inter', size: 24 })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Quote No: ', bold: true, font: 'Inter', size: 18, color: '374151' }),
                      new TextRun({ text: invoiceMeta.quoteNo, font: 'Inter', size: 18, color: '4b5563' })
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Date: ', bold: true, font: 'Inter', size: 18, color: '374151' }),
                      new TextRun({
                        text: (() => {
                          if (!invoiceMeta.date) return '';
                          try {
                            const parts = invoiceMeta.date.split('-');
                            if (parts.length === 3) {
                              const date = new Date(parts[0], parts[1] - 1, parts[2]);
                              return date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                            }
                            return invoiceMeta.date;
                          } catch (e) {
                            return invoiceMeta.date;
                          }
                        })(), font: 'Inter', size: 18, color: '4b5563'
                      })
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      // Divider Line
      const dividerLine = new Paragraph({
        children: [],
        border: {
          bottom: {
            color: '990f02',
            space: 1,
            value: 'single',
            size: 12,
          },
        },
        spacing: { after: 240, before: 120 },
      });

      // 2. Addresses Table (Customer / Seller details)
      const tableAddresses = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'QUOTATION FOR', bold: true, color: '990f02', font: 'Inter', size: 18 })],
                    spacing: { after: 80 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: (customerDetails.name || '').toUpperCase(), bold: true, font: 'Inter', size: 20, color: '990f02' })],
                    spacing: { after: 40 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `${customerDetails.attnSalutation ? `${customerDetails.attnSalutation} ` : ''}${customerDetails.attn}`, font: 'Inter', size: 18, color: '4b5563' })],
                    spacing: { after: 20 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Phone: ${customerDetails.phone}`, font: 'Inter', size: 18, color: '4b5563' })],
                    spacing: { after: 20 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `Destination: ${customerDetails.destination}`, font: 'Inter', size: 18, color: '6b7280' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sellerDetails.name, bold: true, color: '990f02', font: 'Inter', size: 18 })],
                    spacing: { after: 80 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Office: ', bold: true, font: 'Inter', size: 16, color: '374151' }),
                      new TextRun({ text: sellerDetails.office, font: 'Inter', size: 16, color: '4b5563' })
                    ],
                    spacing: { after: 40 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'GSTIN: ', bold: true, font: 'Inter', size: 16, color: '374151' }),
                      new TextRun({ text: sellerDetails.gstin, font: 'Inter', size: 16, color: '4b5563' })
                    ],
                    spacing: { after: 20 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Phone: ', bold: true, font: 'Inter', size: 16, color: '374151' }),
                      new TextRun({ text: sellerDetails.phone, font: 'Inter', size: 16, color: '4b5563' }),
                      new TextRun({ text: ' | Email: ', bold: true, font: 'Inter', size: 16, color: '374151' }),
                      new TextRun({ text: sellerDetails.email, font: 'Inter', size: 16, color: '4b5563' })
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      // 3. Products List Table
      // Header Cells
      const headerRowCells = [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Sr', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Image', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Goods & Service Description', bold: true, color: 'ffffff', font: 'Inter', size: 18 })] })],
        }),
        new TableCell({
          width: { size: 11, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Quantity', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 11, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Rate', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.RIGHT })],
        })
      ];

      if (gstEnabled) {
        headerRowCells.push(
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { fill: '990f02' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
              left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
              right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: 'GST', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.CENTER })],
          })
        );
      }

      headerRowCells.push(
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: '990f02' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            left: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
            right: { style: BorderStyle.SINGLE, size: 6, color: '880e02' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true, color: 'ffffff', font: 'Inter', size: 18 })], alignment: AlignmentType.RIGHT })],
        })
      );

      const tableRows = [
        new TableRow({
          children: headerRowCells,
        })
      ];

      invoiceItems.forEach((item, idx) => {
        const itemSubtotal = item.qty * item.price;
        const itemGst = gstEnabled ? itemSubtotal * (item.gstRate / 100) : 0;
        const itemTotal = itemSubtotal + itemGst;

        const rowCells = [
          new TableCell({
            width: { size: 6, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: (idx + 1).toString(), font: 'Inter', size: 18, color: '64748b' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: item.image ? '[Image Included]' : 'N/A', font: 'Inter', size: 16, color: '64748b' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.description, bold: true, font: 'Inter', size: 18, color: '111827' })]
              }),
              item.size && new Paragraph({
                children: [new TextRun({ text: `Size: ${item.size}`, font: 'Inter', size: 16, color: '64748b', italic: true })],
                spacing: { before: 20 }
              })
            ].filter(Boolean),
          }),
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: item.qty.toLocaleString('en-IN'), font: 'Inter', size: 18, color: '1f2937' })], alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            width: { size: 11, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: '₹' + item.price.toFixed(2), font: 'Inter', size: 18, color: '1f2937' })], alignment: AlignmentType.RIGHT })],
          })
        ];

        if (gstEnabled) {
          rowCells.push(
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              },
              children: [new Paragraph({ children: [new TextRun({ text: `${item.gstRate}%`, font: 'Inter', size: 18, color: '1f2937' })], alignment: AlignmentType.CENTER })],
            })
          );
        }

        rowCells.push(
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
            },
            children: [new Paragraph({ children: [new TextRun({ text: '₹' + itemTotal.toFixed(2), bold: true, font: 'Inter', size: 18, color: '111827' })], alignment: AlignmentType.RIGHT })],
          })
        );

        tableRows.push(
          new TableRow({
            children: rowCells,
          })
        );
      });

      const tableProducts = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
        spacing: { after: 200 }
      });

      // 4. Summary Table (Subtotal, GST, Grand Total)
      const subtotal = invoiceItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
      const gstAmount = invoiceItems.reduce((sum, item) => sum + (item.qty * item.price * (item.gstRate / 100)), 0);
      const grandTotal = subtotal + gstAmount;

      const summaryRows = [];

      if (gstEnabled) {
        summaryRows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                },
                children: [new Paragraph({ children: [new TextRun({ text: 'Subtotal (excl. GST):', bold: true, font: 'Inter', size: 18, color: '475569' })] })],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                },
                children: [new Paragraph({ children: [new TextRun({ text: '₹' + subtotal.toFixed(2), font: 'Inter', size: 18, color: '0f172a' })], alignment: AlignmentType.RIGHT })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                },
                children: [new Paragraph({ children: [new TextRun({ text: 'GST Amount:', bold: true, font: 'Inter', size: 18, color: '475569' })] })],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                },
                children: [new Paragraph({ children: [new TextRun({ text: '₹' + gstAmount.toFixed(2), font: 'Inter', size: 18, color: '0f172a' })], alignment: AlignmentType.RIGHT })],
              }),
            ],
          })
        );
      }

      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              shading: { fill: 'f8fafc' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: '990f02' },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: '990f02' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              },
              children: [new Paragraph({ children: [new TextRun({ text: gstEnabled ? 'Total (incl. GST):' : 'Total:', bold: true, font: 'Inter', size: 20, color: '990f02' })] })],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: 'f8fafc' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: '990f02' },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: '990f02' },
                left: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
                right: { style: BorderStyle.SINGLE, size: 4, color: 'cbd5e1' },
              },
              children: [new Paragraph({ children: [new TextRun({ text: '₹' + grandTotal.toFixed(2), bold: true, font: 'Inter', size: 20, color: '990f02' })], alignment: AlignmentType.RIGHT })],
            }),
          ],
        })
      );

      const tableSummary = new Table({
        width: { size: 40, type: WidthType.PERCENTAGE },
        rows: summaryRows,
        alignment: AlignmentType.RIGHT,
      });

      // 5. Signatures and Footer Details
      const paragraphFooter = new Paragraph({
        children: [
          new TextRun({ text: 'Prepared by: ', bold: true, font: 'Inter', size: 18, color: '1e293b' }),
          new TextRun({ text: invoiceMeta.preparedBy, font: 'Inter', size: 18, color: '1e293b' }),
        ],
        spacing: { before: 400, after: 80 }
      });

      const paragraphElectronically = new Paragraph({
        children: [new TextRun({ text: 'This is electronically generated and does not require signature.', italic: true, font: 'Inter', size: 16, color: '64748b' })],
        spacing: { after: 300 }
      });

      const listTerms = [];
      if (termsAndConditions.length > 0) {
        listTerms.push(
          new Paragraph({
            children: [new TextRun({ text: 'Terms & Conditions', bold: true, font: 'Inter', size: 18, color: '334155' })],
            spacing: { before: 200, after: 100 },
          })
        );
        termsAndConditions.forEach((term, index) => {
          listTerms.push(
            new Paragraph({
              children: [new TextRun({ text: `${index + 1}. ${term}`, font: 'Inter', size: 16, color: '475569' })],
              spacing: { after: 60 }
            })
          );
        });
      }

      const paragraphFooterNote = new Paragraph({
        children: [new TextRun({ text: 'This is a proforma invoice. Prices are indicative and subject to final confirmation.', font: 'Inter', size: 16, color: '94a3b8' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      });

      // Assemble doc
      const docChildren = [
        tableHeader,
        dividerLine,
        tableAddresses,
        new Paragraph({ spacing: { after: 200 } }),
        tableProducts,
      ];

      if (!gstEnabled) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: '5% GST will be charged extra.',
                italic: true,
                font: 'Inter',
                size: 14,
                color: '475569'
              })
            ],
            spacing: { before: 100, after: 100 }
          })
        );
      } else {
        docChildren.push(new Paragraph({ spacing: { after: 100 } }));
      }

      docChildren.push(
        tableSummary,
        paragraphFooter,
        paragraphElectronically,
        ...listTerms,
        paragraphFooterNote
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${customerDetails.name.replace(/\s+/g, '_')}_Quotation_${invoiceMeta.quoteNo}.docx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      appendLog(`Successfully generated and downloaded DOCX quotation: ${fileName}`, 'success');
    } catch (err) {
      console.error('DOCX Generation error:', err);
      alert('Failed to generate DOCX. Error: ' + err.message);
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
      handleDownloadCombinedPDF,
      handleDownloadDocx,
      handleTermChange,
      handleAddTerm,
      handleRemoveTerm,
      gstEnabled,
      setGstEnabled,
      showGstin,
      setShowGstin,
      loadInvoiceData,
      invoiceConfirmModal,
      setInvoiceConfirmModal,
      masterProducts,
      setMasterProducts
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}
