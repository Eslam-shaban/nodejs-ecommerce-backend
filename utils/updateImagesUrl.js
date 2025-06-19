import mongoose from "mongoose";
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const updateImageURLs = async () => {
    try {
        const products = await Product.find({ images: { $exists: true, $ne: [] } });
        console.log(`Found ${products.length} products`);

        for (let product of products) {
            if (!Array.isArray(product.images)) continue;
            // console.log(product.images)
            const updatedImages = product.images.map((img) =>
                img.includes("duoigsila")
                    ? img.replace("res.cloudinary.com/duoigsila", "res.cloudinary.com/eslam-shaban")
                    : img
            );

            product.images = updatedImages;
            await product.save();
            console.log(`✅ Updated ${product._id}`);
        }

        console.log("✅ All product image URLs updated.");
    } catch (error) {
        console.error("❌ Error updating product images:", error);
    } finally {
        mongoose.connection.close();
    }
};

updateImageURLs();
