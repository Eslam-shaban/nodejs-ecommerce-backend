import express from "express";
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
} from "../controllers/orderController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create Order (User must be logged in)
router.post('/', protect, createOrder);

// Get USer's Order
router.get('/my-orders', protect, getMyOrders);

// Get All Orders (Admin only)
router.get("/", protect, isAdmin, getAllOrders);

// Update Order to Paid
router.put('/:id/pay', protect, updateOrderToPaid);

// Udate order to Delivered (Admin only)
router.put('/:id/deliver', protect, isAdmin, updateOrderToDelivered);

export default router;
