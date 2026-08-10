// @ts-nocheck
import Product from '../models/Product';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

const defaultProducts = [
  {
    id: 1,
    description: 'Chips & Upperi Combo',
    size: 'Standup Pouch',
    price: 160,
    gstRate: 5,
    image: '/standup_pouch_combo.png'
  },
  {
    id: 2,
    description: 'Chips & Upperi Combo',
    size: 'Container',
    price: 250,
    gstRate: 5,
    image: '/container_combo.png'
  }
];

const getProducts = catchAsync(async (req, res, next) => {
  let products = await Product.find().sort({ id: 1 });
  
  if (products.length === 0) {
    // Seed default products
    await Product.insertMany(defaultProducts);
    products = await Product.find().sort({ id: 1 });
  }
  
  res.json(products);
});

const createProduct = catchAsync(async (req, res, next) => {
  const { id, description, size, price, gstRate, image } = req.body;
  
  // Find next ID if not provided
  let nextId = id;
  if (!nextId) {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    nextId = lastProduct ? lastProduct.id + 1 : 1;
  }
  
  const existingProduct = await Product.findOne({ id: nextId });
  if (existingProduct) {
    throw new AppError('Product with this ID already exists', 400);
  }
  
  const product = new Product({
    id: nextId,
    description,
    size,
    price: Number(price) || 0,
    gstRate: Number(gstRate) || 18,
    image: image || ''
  });
  
  await product.save();
  res.status(201).json(product);
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { description, size, price, gstRate, image } = req.body;
  
  const product = await Product.findOneAndUpdate(
    { id: Number(id) },
    {
      description,
      size,
      price: Number(price) || 0,
      gstRate: Number(gstRate) || 18,
      image: image || ''
    },
    { returnDocument: 'after', runValidators: true }
  );
  
  if (!product) {
    throw new AppError('Product not found for update', 404);
  }
  
  res.json(product);
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findOneAndDelete({ id: Number(id) });
  
  if (!product) {
    throw new AppError('Product not found for deletion', 404);
  }
  
  res.json({ success: true, message: 'Product deleted successfully.' });
});

export default { 
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
 };
