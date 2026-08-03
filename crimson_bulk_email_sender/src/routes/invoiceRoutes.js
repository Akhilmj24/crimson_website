const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { validateInvoice } = require('../validators/invoiceValidator');

const router = express.Router();

router.get('/invoices', invoiceController.getInvoices);
router.get('/invoices/:id', invoiceController.getInvoice);
router.post('/invoices', auth, validate(validateInvoice), invoiceController.createInvoice);
router.put('/invoices/:id', auth, validate(validateInvoice), invoiceController.updateInvoice);
router.delete('/invoices/:id', auth, invoiceController.deleteInvoice);

module.exports = router;
