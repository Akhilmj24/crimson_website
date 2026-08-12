// @ts-nocheck
import express from 'express';
import documentController from '../controllers/documentController';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/documents', documentController.getDocuments);
router.post('/documents', auth, documentController.createDocument);
router.delete('/documents/:id', auth, documentController.deleteDocument);

export default router;
