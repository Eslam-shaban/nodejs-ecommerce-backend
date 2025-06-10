import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Ensure to include the `.js` extension for local files
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Database connection
connectDB();

const app = express();

// if we using cookies instead of localStorage
// app.use(cookieParser());


// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    credentials: true // Allow cookies and authorization headers
}));

app.use('/api/v1/products', productRoutes)
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/orders', orderRoutes); //  Use order routes



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
