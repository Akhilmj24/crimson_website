// @ts-nocheck
import express from 'express';
import productController from '../controllers/productController';
import auth from '../middlewares/auth';

const router = express.Router();

router.get('/products', productController.getProducts);
router.post('/products', auth, productController.createProduct);
router.put('/products/:id', auth, productController.updateProduct);
router.delete('/products/:id', auth, productController.deleteProduct);

export default router;
