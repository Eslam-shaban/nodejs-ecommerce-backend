import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Product from '../models/Product.js'; // Adjust path if needed

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const updateProductImagesFromFile = async () => {
    try {
        // Read products with images
        const productsWithImages = JSON.parse(fs.readFileSync('./data/products_with_reviews.json', 'utf-8'));

        for (const productData of productsWithImages) {
            // Find the product by name
            const product = await Product.findOne({ name: productData.name });

            if (product) {
                // Update images
                product.images = productData.images;

                // Save updated product
                await product.save();

                console.log(`Images updated for product: ${productData.name}`);
            } else {
                console.log(`Product not found: ${productData.name}`);
            }
        }

        console.log("All products' images updated successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error updating images:", error);
        mongoose.connection.close();
    }
};

updateProductImagesFromFile();
