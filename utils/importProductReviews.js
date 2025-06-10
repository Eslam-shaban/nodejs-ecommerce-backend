import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const updateProductReviews = async () => {
    try {
        // Step 1: Fetch all users to select random userId for the reviews
        const users = await User.find({}, '_id'); // Get only the _id field of the users
        if (users.length === 0) {
            console.log('No users found in the database');
            return;
        }

        // Step 2: Define your product data with reviews from JSON file
        const productsWithReviews = JSON.parse(fs.readFileSync('./data/products_with_reviews.json', 'utf-8'));

        // Step 3: Loop over the products and add reviews with random userId
        for (const productData of productsWithReviews) {
            // Find the product by name (or another unique field)
            const product = await Product.findOne({ name: productData.name });

            if (product) {
                // Step 4: Add the reviews with random userId
                const updatedReviews = await Promise.all(
                    productData.reviews.map(async (review) => {
                        // Pick a random user from the list of users
                        const randomUser = users[Math.floor(Math.random() * users.length)];

                        return {
                            user: randomUser._id,  // Assign random userId
                            rating: review.rating,
                            comment: review.comment,
                        };
                    })
                );

                // Step 5: Add reviews to the product
                product.reviews.push(...updatedReviews);

                // Step 6: Save the product with the updated reviews
                await product.save();

                console.log(`Reviews added for product: ${productData.name}`);
            } else {
                console.log(`Product not found: ${productData.name}`);
            }
        }

        console.log('Reviews successfully added to products');
    } catch (error) {
        console.error('Error adding reviews to products:', error);
    } finally {
        // Close the MongoDB connection when done
        mongoose.connection.close();
    }
};

// Call the function to update the products
updateProductReviews();
