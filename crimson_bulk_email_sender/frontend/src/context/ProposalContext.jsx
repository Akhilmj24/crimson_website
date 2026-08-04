import React, { createContext, useContext, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } from 'docx';
import { useCampaign } from './CampaignContext';
import { proposalService } from '../services/proposalService';

const ProposalContext = createContext();

export function useProposal() {
  return useContext(ProposalContext);
}

export function ProposalProvider({ children }) {
  const { appendLog } = useCampaign();
  const [proposalConfirmModal, setProposalConfirmModal] = useState({ isOpen: false, onConfirm: null });

  const [activeProposalId, setActiveProposalId] = useState(null);
  const [sender, setSender] = useState({
    name: 'AKHIL',
    title: 'Manager',
    company: 'Crimson Group LLP',
    address: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
    email: 'crimsongroupllp@gmail.com',
    phone: '+91 99467 99457'
  });

  const [recipient, setRecipient] = useState({
    name: 'Mr Akhil',
    title: 'Manager ISL & Marketing',
    company: 'Client Compay',
    address: 'Trivandrum, Kerala'
  });

  const [meta, setMeta] = useState({
    proposalId: 'SP-PR-' + Math.floor(1000 + Math.random() * 9000),
    date: (() => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    })(),
    subject: 'PREMIUM ONAM CORPORATE GIFT COMBO - A Taste of Tradition. A Gift of Happiness.',
    salutation: 'Dear Mr Akhil,',
    intro: 'Greetings from Crimson Group LLP. This Onam, we are pleased to present a premium corporate gifting solution that combines authentic Kerala flavours, dependable quality, hygienic packing and elegant festive presentation. Designed for organizations that value thoughtful gifting, the Crimson Onam Combo is a convenient and memorable way to appreciate employees, customers, clients and business associates.'
  });

  const [sections, setSections] = useState([
    {
      id: 1,
      title: 'THE ONAM COMBO',
      content: 'Kerala Banana Chips - 200 g\nSharkara Upperi - 100 g\n\nA balanced combination of crispy Kerala banana chips and traditional sweet Sharkara Upperi—two familiar festive favourites presented in a professional format suitable for corporate gifting.'
    },
    {
      id: 2,
      title: 'QUALITY & PACKAGING',
      content: '- Authentic taste: Banana chips prepared in coconut oil for the traditional Kerala flavour, paired with sweet and crunchy Sharkara Upperi.\n- Fresh & carefully prepared: Produced in controlled batches with attention to taste, texture and crispness.\n- Premium stand-up pouches: Products are separately packed for convenient handling, storage and distribution, with festive Crimson branding for a polished presentation.\n- Product focus: Premium ingredients, hygienic packing, freshness, convenient handling and no unnecessary preservatives.'
    },
    {
      id: 3,
      title: 'IDEAL FOR CORPORATE GIFTING',
      content: 'Suitable for employee Onam gifts, customer appreciation, client and business-partner gifting, dealer/distributor gifts, office celebrations, festive giveaways and bulk institutional requirements. The individually packed format also supports organized distribution across teams, branches and customer groups.'
    },
    {
      id: 4,
      title: 'CUSTOMIZATION & BULK ORDERS',
      content: 'For eligible bulk orders, we can discuss solutions based on quantity, budget and presentation requirements, including custom stickers or branding, corporate greeting messages, customized outer packaging, gift presentation and alternate product/quantity combinations. This allows the combo to serve as both a Crimson festive gift and a customized corporate gifting experience.'
    },
    {
      id: 5,
      title: 'WHY CRIMSON?',
      content: 'Crimson Group LLP brings traditional Kerala products into a modern, professional gifting format. From product preparation and hygienic packing to presentation and bulk-order coordination, our goal is to provide a dependable Onam gift that your organization can confidently share with the people who matter.'
    }
  ]);

  // Initialize draft: Load from DB, Migrate legacy, or create a default document
  useEffect(() => {
    const initializeProposalDraft = async () => {
      let activeId = localStorage.getItem('active_proposal_id');

      if (activeId) {
        try {
          const res = await proposalService.getProposal(activeId);
          if (res) {
            setSender(res.sender || {});
            setRecipient(res.recipient || {});
            setSections(res.sections || []);
            setMeta(res.meta || {});
            setActiveProposalId(activeId);
            return;
          }
        } catch (err) {
          console.warn('Failed to load active proposal from MongoDB, resetting active ID', err.message);
          localStorage.removeItem('active_proposal_id');
          activeId = null;
        }
      }

      // Check for legacy localStorage data
      const hasLegacyData = localStorage.getItem('proposal_sender') ||
        localStorage.getItem('proposal_recipient') ||
        localStorage.getItem('proposal_sections');

      if (hasLegacyData) {
        try {
          const legacyPayload = {
            sender: localStorage.getItem('proposal_sender') ? JSON.parse(localStorage.getItem('proposal_sender')) : {
              name: 'AKHIL',
              title: 'Manager',
              company: 'Crimson Group LLP',
              address: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
              email: 'crimsongroupllp@gmail.com',
              phone: '+91 99467 99457'
            },
            recipient: localStorage.getItem('proposal_recipient') ? JSON.parse(localStorage.getItem('proposal_recipient')) : {
              name: 'Mr Akhil',
              title: 'Manager ISL & Marketing',
              company: 'Client Compay',
              address: 'Trivandrum, Kerala'
            },
            meta: localStorage.getItem('proposal_meta') ? JSON.parse(localStorage.getItem('proposal_meta')) : {
              proposalId: 'SP-PR-' + Math.floor(1000 + Math.random() * 9000),
              date: new Date().toISOString().split('T')[0],
              subject: 'PREMIUM ONAM CORPORATE GIFT COMBO - A Taste of Tradition. A Gift of Happiness.',
              salutation: 'Dear Mr Akhil,',
              intro: 'Greetings from Crimson Group LLP. This Onam, we are pleased to present a premium corporate gifting solution that combines authentic Kerala flavours, dependable quality, hygienic packing and elegant festive presentation. Designed for organizations that value thoughtful gifting, the Crimson Onam Combo is a convenient and memorable way to appreciate employees, customers, clients and business associates.'
            },
            sections: localStorage.getItem('proposal_sections') ? JSON.parse(localStorage.getItem('proposal_sections')) : [
              {
                id: 1,
                title: 'THE ONAM COMBO',
                content: 'Kerala Banana Chips - 200 g\nSharkara Upperi - 100 g\n\nA balanced combination of crispy Kerala banana chips and traditional sweet Sharkara Upperi—two familiar festive favourites presented in a professional format suitable for corporate gifting.'
              }
            ]
          };

          const newProposal = await proposalService.createProposal(legacyPayload);
          localStorage.setItem('active_proposal_id', newProposal._id);
          setActiveProposalId(newProposal._id);
          setSender(newProposal.sender || {});
          setRecipient(newProposal.recipient || {});
          setSections(newProposal.sections || []);
          setMeta(newProposal.meta || {});

          // Safe clean legacy keys after successful migration save
          localStorage.removeItem('proposal_sender');
          localStorage.removeItem('proposal_recipient');
          localStorage.removeItem('proposal_meta');
          localStorage.removeItem('proposal_sections');
          return;
        } catch (err) {
          console.error('Migration of legacy proposal data to MongoDB failed:', err.message);
        }
      }

      // No active draft or legacy data, query MongoDB list
      try {
        const proposals = await proposalService.getProposals();
        if (proposals && proposals.length > 0) {
          const latest = proposals[0];
          localStorage.setItem('active_proposal_id', latest._id);
          setActiveProposalId(latest._id);
          setSender(latest.sender || {});
          setRecipient(latest.recipient || {});
          setSections(latest.sections || []);
          setMeta(latest.meta || {});
        } else {
          // Empty DB, create initial default document
          const newProposal = await proposalService.createProposal({
            sender: {
              name: 'AKHIL',
              title: 'Manager',
              company: 'Crimson Group LLP',
              address: 'Dwaraka, RKN Nagar, Ezhakode, Vilavoorkkal, Malayinkeezhu PO, Thiruvananthapuram, Kerala, 695571',
              email: 'crimsongroupllp@gmail.com',
              phone: '+91 99467 99457'
            },
            recipient: {
              name: 'Mr Akhil',
              title: 'Manager ISL & Marketing',
              company: 'Client Compay',
              address: 'Trivandrum, Kerala'
            },
            meta: {
              proposalId: 'SP-PR-' + Math.floor(1000 + Math.random() * 9000),
              date: new Date().toISOString().split('T')[0],
              subject: 'PREMIUM ONAM CORPORATE GIFT COMBO - A Taste of Tradition. A Gift of Happiness.',
              salutation: 'Dear Mr Akhil,',
              intro: 'Greetings from Crimson Group LLP. This Onam, we are pleased to present a premium corporate gifting solution that combines authentic Kerala flavours, dependable quality, hygienic packing and elegant festive presentation.'
            },
            sections: [
              {
                title: 'THE ONAM COMBO',
                content: 'Kerala Banana Chips - 200 g\nSharkara Upperi - 100 g\n\nA balanced combination of crispy Kerala banana chips and traditional sweet Sharkara Upperi—two familiar festive favourites presented in a professional format suitable for corporate gifting.'
              }
            ]
          });
          localStorage.setItem('active_proposal_id', newProposal._id);
          setActiveProposalId(newProposal._id);
          setSender(newProposal.sender || {});
          setRecipient(newProposal.recipient || {});
          setSections(newProposal.sections || []);
          setMeta(newProposal.meta || {});
        }
      } catch (err) {
        console.error('Initialization proposal draft error:', err.message);
      }
    };

    initializeProposalDraft();
  }, []);

  // Debounced auto-save to MongoDB
  useEffect(() => {
    if (!activeProposalId) return;

    const timer = setTimeout(async () => {
      try {
        await proposalService.updateProposal(activeProposalId, {
          sender,
          recipient,
          sections,
          meta
        });
      } catch (err) {
        console.error('Proposal draft autosave failed:', err.message);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sender, recipient, sections, meta, activeProposalId]);

  const handleAddSection = () => {
    const nextId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    setSections([
      ...sections,
      {
        id: nextId,
        title: 'NEW SECTION',
        content: 'Enter section content here...'
      }
    ]);
  };

  const handleRemoveSection = (id) => {
    if (sections.length === 1) {
      alert('Proposal must have at least one section.');
      return;
    }
    setSections(sections.filter(s => s.id !== id));
  };

  const handleSectionChange = (id, field, value) => {
    setSections(sections.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const loadProposalData = (data) => {
    if (!data) return;
    if (data.sender) setSender(data.sender);
    if (data.recipient) setRecipient(data.recipient);
    if (data.meta) setMeta(data.meta);
    if (data.sections) setSections(data.sections);
  };

  const handleDownloadPDF = async (options = { skipPrompt: false }) => {
    const element = document.getElementById('proposal-pdf-area');
    if (!element) return;

    try {
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
      const pageHeight = 297;

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

      const fileName = `${recipient.company.replace(/\s+/g, '_')}_Proposal_${meta.proposalId}.pdf`;
      pdf.save(fileName);
      appendLog(`Successfully generated and downloaded PDF proposal: ${fileName}`, 'success');

      // Save to document history
      try {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'proposal',
            clientName: recipient.company || recipient.name || 'Client',
            documentId: meta.proposalId,
            proposalData: { sender, recipient, meta, sections }
          })
        });
      } catch (historyErr) {
        console.error('Failed to log document history:', historyErr);
      }

      // Prompt to change serial number
      if (!options?.skipPrompt) {
        setTimeout(() => {
          setProposalConfirmModal({
            isOpen: true,
            onConfirm: () => {
              setMeta(prev => ({
                ...prev,
                proposalId: 'SP-PR-' + Math.floor(1000 + Math.random() * 9000)
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

  const handleDownloadDocx = async () => {
    try {
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
                      new TextRun({ text: '●', color: '660a01', size: 36 }),
                      new TextRun({ text: '● ', color: 'ffc72c', size: 36 }),
                      new TextRun({ text: 'yourlogo', bold: true, size: 28, font: 'Inter', color: '111827' }),
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
                    children: [new TextRun({ text: sender.company.toUpperCase(), bold: true, color: '990f02', font: 'Inter', size: 24 })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: sender.address, font: 'Inter', size: 16, color: '6b7280' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: sender.email, font: 'Inter', size: 16, color: '6b7280' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                  sender.phone && new Paragraph({
                    children: [new TextRun({ text: sender.phone, font: 'Inter', size: 16, color: '6b7280' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                ].filter(Boolean),
              }),
            ],
          }),
        ],
      });

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

      const tableRecipient = new Table({
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
                width: { size: 60, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: (recipient.company || '').toUpperCase(), bold: true, color: '990f02', font: 'Inter', size: 22 })],
                    spacing: { after: 40 },
                  }),
                  recipient.name && recipient.name.trim() ? new Paragraph({
                    children: [new TextRun({
                      text: recipient.name.toLowerCase().startsWith('attn') ? recipient.name : `${recipient.name}`,
                      bold: true,
                      font: 'Inter',
                      size: 18,
                      color: '374151'
                    })],
                    spacing: { after: 40 },
                  }) : null,
                  recipient.title && recipient.title.trim() ? new Paragraph({
                    children: [new TextRun({ text: recipient.title, font: 'Inter', size: 18, color: '4b5563' })],
                    spacing: { after: 40 },
                  }) : null,
                  new Paragraph({
                    children: [new TextRun({ text: recipient.address, font: 'Inter', size: 16, color: '6b7280' })],
                  }),
                ].filter(Boolean),
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: formatDate(meta.date), font: 'Inter', bold: true, size: 18, color: '4b5563' })],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const bodyParagraphs = [];

      bodyParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'SUBJECT', bold: true, color: '4b5563', font: 'Inter', size: 18 })],
          spacing: { before: 240, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: meta.subject, bold: true, font: 'Inter', size: 20, color: '990f02' })],
          spacing: { after: 240 },
        })
      );

      const activeSalutation = !recipient.name || !recipient.name.trim() ? 'Dear Sir/Madam,' : meta.salutation;
      bodyParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: activeSalutation, font: 'Inter', size: 20, color: '1f2937' })],
          spacing: { after: 180 },
        })
      );

      meta.intro.split('\n').forEach(pText => {
        if (pText.trim()) {
          bodyParagraphs.push(
            new Paragraph({
              children: [new TextRun({ text: pText.trim(), font: 'Inter', size: 20, color: '374151' })],
              spacing: { after: 120 },
            })
          );
        }
      });

      sections.forEach(sec => {
        bodyParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: sec.title.toUpperCase(), bold: true, color: '990f02', font: 'Inter', size: 18 })],
            spacing: { before: 240, after: 60 },
          })
        );
        sec.content.split('\n').forEach(pText => {
          if (pText.trim()) {
            bodyParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: pText.trim(), font: 'Inter', size: 20, color: '374151' })],
                spacing: { after: 120 },
              })
            );
          }
        });
      });

      bodyParagraphs.push(
        new Paragraph({ spacing: { before: 240 } }),
        new Paragraph({
          children: [new TextRun({
            text: 'We would be pleased to discuss your required quantity, customization preferences, delivery schedule, and commercial quotation and prepare a suitable proposal for your organization.',
            font: 'Inter',
            size: 20,
            color: '374151'
          })],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: 'We look forward to the opportunity to be part of your Onam celebrations and help you share a taste of tradition and a gift of happiness with the people who matter to your organization.',
            font: 'Inter',
            size: 20,
            color: '374151'
          })],
          spacing: { after: 180 },
        }),
        new Paragraph({
          children: [],
          border: {
            bottom: {
              color: 'cbd5e1',
              space: 1,
              value: 'single',
              size: 6,
            },
          },
          spacing: { before: 120, after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Warm regards,', font: 'Inter', italic: true, size: 20, color: '4b5563' })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Akhil', bold: true, font: 'Inter', color: '990f02', size: 22 })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Crimson Group LLP', bold: true, font: 'Inter', size: 18, color: '1f2937' })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Email: crimsongroupllp@gmail.com', font: 'Inter', size: 16, color: '6b7280' })],
          spacing: { after: 20 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Phone: 99467 99457', font: 'Inter', size: 16, color: '6b7280' })],
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            tableHeader,
            dividerLine,
            tableRecipient,
            new Paragraph({ spacing: { after: 200 } }),
            ...bodyParagraphs
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${recipient.company.replace(/\s+/g, '_')}_Proposal_${meta.proposalId}.docx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      appendLog(`Successfully generated and downloaded DOCX proposal: ${fileName}`, 'success');
    } catch (err) {
      console.error('DOCX Generation error:', err);
      alert('Failed to generate DOCX. Error: ' + err.message);
    }
  };

  return (
    <ProposalContext.Provider value={{
      sender,
      setSender,
      recipient,
      setRecipient,
      meta,
      setMeta,
      sections,
      setSections,
      handleAddSection,
      handleRemoveSection,
      handleSectionChange,
      handleDownloadPDF,
      handleDownloadDocx,
      formatDate,
      loadProposalData,
      proposalConfirmModal,
      setProposalConfirmModal
    }}>
      {children}
    </ProposalContext.Provider>
  );
}
