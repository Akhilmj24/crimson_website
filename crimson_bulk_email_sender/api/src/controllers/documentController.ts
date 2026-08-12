// @ts-nocheck
import documentService from '../services/documentService';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

const getDocuments = catchAsync(async (req, res, next) => {
  const docs = await documentService.getAllDocuments();
  res.json(docs);
});

const createDocument = catchAsync(async (req, res, next) => {
  const { type, clientName, documentId, proposalData, invoiceData } = req.body;
  if (!type || !clientName || !documentId) {
    return next(new AppError('Missing required fields: type, clientName, or documentId', 400));
  }
  const doc = await documentService.createDocumentRecord({
    type,
    clientName,
    documentId,
    proposalData,
    invoiceData
  });
  res.json({ success: true, data: doc });
});

const deleteDocument = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await documentService.deleteDocument(id);
  if (!deleted) {
    return next(new AppError('Document history record not found', 404));
  }
  res.json({ success: true, message: 'Document history record deleted successfully.' });
});

export default { 
  getDocuments,
  createDocument,
  deleteDocument
 };
