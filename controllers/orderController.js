import Order from '../models/Order.js';
import Product from '../models/Product.js';

//  Create a new order
// export const createOrder = async (req, res) => {
//     try {
//         const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

//         // console.log(req.user);
//         if (!orderItems || orderItems.length === 0) {
//             return res.status(400).json({ success: false, message: "No items in the order" });
//         }
//         const order = new Order({ user: req.user._id, orderItems, shippingAddress, paymentMethod, totalPrice });
//         // console.log(order);
//         const createdOrder = await order.save();
//         res.status(201).json({ success: true, createdOrder });
//     }
//     catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No items in the order" });
        }

        // Check stock availability
        for (const item of orderItems) {
            const product = await Product.findById(item._id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `${item.name} is out of stock.` });
            }
        }

        // Create order
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'unpaid'
        });

        const createdOrder = await order.save();

        // Reduce stock immediately for COD
        if (paymentMethod === 'cod') {
            for (const item of orderItems) {
                const product = await Product.findById(item._id);
                product.stock -= item.quantity;
                await product.save();
            }
        }

        res.status(201).json({ success: true, createdOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get all orders (Admin only)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

//Get logged-in user's orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//  Update order to "Paid"
export const updateOrderToPaid = async (req, res) => {
    const id = req.params.id;
    // Validate MongoDB ObjectID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: "Invalid order ID"
        });
    }
    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        order.paymentStatus = "paid";
        const updatedOrder = await order.save();
        res.status(200).json({ success: true, updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//   Update order to "Delivered" (Admin only)
export const updateOrderToDelivered = async (req, res) => {
    const id = req.params.id;
    // Validate MongoDB ObjectID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: "Invalid order ID"
        });
    }
    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.isDelivered = true;
        const updatedOrder = await order.save();

        res.status(200).json({ success: true, updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};