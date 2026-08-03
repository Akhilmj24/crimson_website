const express = require('express');
const documentController = require('../controllers/documentController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/documents', documentController.getDocuments);
router.post('/documents', auth, documentController.createDocument);
router.delete('/documents/:id', auth, documentController.deleteDocument);

module.exports = router;
