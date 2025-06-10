import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Product from '../models/Product.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const importProducts = async () => {
    try {
        const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
        await Product.insertMany(products);
        console.log("Products Added Successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error Importing Products:", error);
        mongoose.connection.close();
    }
};

importProducts();
