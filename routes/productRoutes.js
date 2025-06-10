import express from 'express';

const router = express.Router();

import {
    getProducts, getProductById, createProduct, updateProduct,
    deleteProduct, getCategories, getProductsInCategory, getProductsBySearch
} from '../controllers/productController.js'
import { protect, isAdmin } from '../middlewares/authMiddleware.js';

// Public Routes
router.get('/categories', getCategories);  // ✅ This comes first
router.get('/category/:category', getProductsInCategory); // ✅ Then this
router.get('/search', getProductsBySearch);
router.get('/', getProducts);
router.get('/:id', getProductById); // ✅ Now this comes last

// Protected Routes (Admin Only)
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;
