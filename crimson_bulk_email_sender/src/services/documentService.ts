// @ts-nocheck
import DocumentHistory from '../models/DocumentHistory';
import { isDBConnected } from '../config/db';

const inMemoryDocuments = [];

const getAllDocuments = async () => {
  const dbConnected = isDBConnected();
  if (dbConnected) {
    try {
      return await DocumentHistory.find().sort({ createdAt: -1 });
    } catch (err) {
      console.error('Failed to retrieve documents from database:', err.message);
    }
  }
  return [...inMemoryDocuments].sort((a, b) => b.createdAt - a.createdAt);
};

const createDocumentRecord = async ({ type, clientName, documentId, proposalData, invoiceData }) => {
  const dbConnected = isDBConnected();
  if (dbConnected) {
    try {
      const doc = new DocumentHistory({
        type,
        clientName,
        documentId,
        proposalData,
        invoiceData
      });
      await doc.save();
      return doc;
    } catch (err) {
      console.error('Failed to save document history to MongoDB:', err.message);
    }
  }

  // Fallback in-memory
  const id = 'doc_mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const doc = {
    _id: id,
    type,
    clientName,
    documentId,
    proposalData,
    invoiceData,
    createdAt: new Date()
  };
  inMemoryDocuments.push(doc);
  return doc;
};

const deleteDocument = async (id) => {
  const dbConnected = isDBConnected();
  if (dbConnected && !id.startsWith('doc_mem_')) {
    const result = await DocumentHistory.findByIdAndDelete(id);
    return !!result;
  }
  const index = inMemoryDocuments.findIndex(d => d._id === id);
  if (index !== -1) {
    inMemoryDocuments.splice(index, 1);
    return true;
  }
  return false;
};

export default { 
  getAllDocuments,
  createDocumentRecord,
  deleteDocument
 };
