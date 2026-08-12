// @ts-nocheck
import express from 'express';
import invoiceController from '../controllers/invoiceController';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { validateInvoice } from '../validators/invoiceValidator';

const router = express.Router();

router.get('/invoices', invoiceController.getInvoices);
router.get('/invoices/:id', invoiceController.getInvoice);
router.post('/invoices', auth, validate(validateInvoice), invoiceController.createInvoice);
router.put('/invoices/:id', auth, validate(validateInvoice), invoiceController.updateInvoice);
router.delete('/invoices/:id', auth, invoiceController.deleteInvoice);

export default router;
