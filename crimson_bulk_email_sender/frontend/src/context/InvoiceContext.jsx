import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';
import { useCampaign } from './CampaignContext';
import { useProposal } from './ProposalContext';
import { product, terms } from './data';

const InvoiceContext = createContext();

export function useInvoice() {
  return useContext(InvoiceContext);
}

export function InvoiceProvider({ children }) {
  const { appendLog } = useCampaign();
  const proposalContext = useProposal();
  const [invoiceConfirmModal, setInvoiceConfirmModal] = useState({ isOpen: false, onConfirm: null });

  const [customerDetails, setCustomerDetails] = useState(() => {
    const saved = localStorage.getItem('invoice_customerDetails');
    return saved ? JSON.parse(saved) : {
      name: 'Athen Cars',
      attn: 'Mr Satheesh V S',
      phone: '+91 9744050505',
      destination: 'Athen Gardens, Chakka, Anayara, Trivandrum, Kerala'
    };
  });

  // Synchronize Invoice customerDetails and Proposal recipient
  const prevRecipientRef = useRef(proposalContext?.recipient);
  const prevCustomerDetailsRef = useRef(customerDetails);

  useEffect(() => {
    if (!proposalContext) return;

    const recipient = proposalContext.recipient;
    const isRecipientChanged =
      recipient.company !== prevRecipientRef.current?.company ||
      recipient.name !== prevRecipientRef.current?.name ||
      recipient.address !== prevRecipientRef.current?.address;

    const isCustomerDetailsChanged =
      customerDetails.name !== prevCustomerDetailsRef.current?.name ||
      customerDetails.attn !== prevCustomerDetailsRef.current?.attn ||
      customerDetails.destination !== prevCustomerDetailsRef.current?.destination;

    const companyDiff = recipient.company !== customerDetails.name;
    const nameDiff = recipient.name !== customerDetails.attn;
    const addressDiff = recipient.address !== customerDetails.destination;

    if (isRecipientChanged && !isCustomerDetailsChanged) {
      if (companyDiff || nameDiff || addressDiff) {
        setCustomerDetails(prev => ({
          ...prev,
          name: recipient.company || '',
          attn: recipient.name || '',
          destination: recipient.address || ''
        }));
      }
    } else if (isCustomerDetailsChanged && !isRecipientChanged) {
      if (companyDiff || nameDiff || addressDiff) {
        proposalContext.setRecipient(prev => ({
          ...prev,
          company: customerDetails.name || '',
          name: customerDetails.attn || '',
          address: customerDetails.destination || ''
        }));
      }
    }

    prevRecipientRef.current = recipient;
    prevCustomerDetailsRef.current = customerDetails;
  }, [proposalContext?.recipient, customerDetails]);

  const [invoiceMeta, setInvoiceMeta] = useState(() => {
    const saved = localStorage.getItem('invoice_meta');
    return saved ? JSON.parse(saved) : {
      quoteNo: 'SP-PQ-' + Math.floor(1000 + Math.random() * 9000),
      date: (() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      })(),
      preparedBy: 'Akhil'
    };
  });

  const [sellerDetails, setSellerDetails] = useState(() => {
    const saved = localStorage.getItem('invoice_sellerDetails');
    return saved ? JSON.parse(saved) : {
      name: 'Crimson Group LLP',
      office: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
      gstin: '06ADMTEST',
      phone: '+91 99467 99457',
      email: 'crimsongroupllp@gmail.com'
    };
  });

  const [invoiceItems, setInvoiceItems] = useState(() => {
    const saved = localStorage.getItem('invoice_items');
    return saved ? JSON.parse(saved) : product;
  });

  const [termsAndConditions, setTermsAndConditions] = useState(() => {
    const saved = localStorage.getItem('invoice_terms');
    return saved ? JSON.parse(saved) : terms;
  });

  // Edit authorization states: init as false
  const [allowEditSeller, setAllowEditSeller] = useState(false);
  const [allowEditTerms, setAllowEditTerms] = useState(false);

  // GST toggle: enabled by default
  const [gstEnabled, setGstEnabled] = useState(() => {
    const saved = localStorage.getItem('invoice_gstEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showGstin, setShowGstin] = useState(() => {
    const saved = localStorage.getItem('invoice_showGstin');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [masterProducts, setMasterProducts] = useState(() => {
    const saved = localStorage.getItem('invoice_masterProducts');
    return saved ? JSON.parse(saved) : product;
  });

  useEffect(() => {
    localStorage.setItem('invoice_customerDetails', JSON.stringify(customerDetails));
  }, [customerDetails]);

  useEffect(() => {
    localStorage.setItem('invoice_meta', JSON.stringify(invoiceMeta));
  }, [invoiceMeta]);

  useEffect(() => {
    localStorage.setItem('invoice_sellerDetails', JSON.stringify(sellerDetails));
  }, [sellerDetails]);

  useEffect(() => {
    localStorage.setItem('invoice_items', JSON.stringify(invoiceItems));
  }, [invoiceItems]);

  useEffect(() => {
    localStorage.setItem('invoice_terms', JSON.stringify(termsAndConditions));
  }, [termsAndConditions]);

  useEffect(() => {
    localStorage.setItem('invoice_gstEnabled', JSON.stringify(gstEnabled));
  }, [gstEnabled]);

  useEffect(() => {
    localStorage.setItem('invoice_showGstin', JSON.stringify(showGstin));
  }, [showGstin]);

  useEffect(() => {
    localStorage.setItem('invoice_masterProducts', JSON.stringify(masterProducts));
  }, [masterProducts]);

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
        scale: 2,
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
        scale: 2,
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
                    children: [new TextRun({ text: 'PRE-QUOTATION', bold: true, color: '990f02', font: 'Inter', size: 24 })],
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
                    children: [new TextRun({ text: `${customerDetails.attn}`, font: 'Inter', size: 18, color: '4b5563' })],
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
          width: { size: 62, type: WidthType.PERCENTAGE },
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
            width: { size: 62, type: WidthType.PERCENTAGE },
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
        children: [new TextRun({ text: 'This is a pre-quotation. Prices are indicative and subject to final confirmation.', font: 'Inter', size: 16, color: '94a3b8' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      });

      // Assemble doc
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            tableHeader,
            dividerLine,
            tableAddresses,
            new Paragraph({ spacing: { after: 200 } }),
            tableProducts,
            new Paragraph({ spacing: { after: 100 } }),
            tableSummary,
            paragraphFooter,
            paragraphElectronically,
            ...listTerms,
            paragraphFooterNote
          ],
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
