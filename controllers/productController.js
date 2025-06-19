
import Product from '../models/Product.js';

// Get All Products (Public) with Pagination
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;  // Default to page 1 and limit 10
        // Calculate skip based on page number and limit
        const skip = (page - 1) * limit;

        // Fetch products with pagination (skip and limit)
        const products = await Product.find()
            .skip(skip)  // Skip products based on current page
            .limit(Number(limit));  // Limit the number of products per page

        // Get total number of products for pagination
        const totalProducts = await Product.countDocuments();

        // If no products found
        if (!products.length) {
            return res.status(404).json({ success: false, message: "No products found" });
        }

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                limit: Number(limit),
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get Product By ID (Public)
export const getProductById = async (req, res) => {
    const id = req.params.id;
    // Validate MongoDB ObjectID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: "Invalid product ID"
        });
    }
    try {
        const product = await Product.findById(id);
        if (!product)
            return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Create New Product (Admin Only)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            images,
        });
        // console.log(newProduct);
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, message: savedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update Product (Admin Only)
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;
        const id = req.params.id;
        // Validate MongoDB ObjectID
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product ID"
            });
        }
        const product = await Product.findById(id);
        // console.log("product will be updated", product);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;
        product.images = images || product.images;

        const updatedProduct = await product.save();
        res.status(200).json({ success: true, updatedProduct });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
};

// Delete Product (Admin Only)
export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    // Validate MongoDB ObjectID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            error: "Invalid product ID"
        });
    }
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: true, message: "Product not found" });

        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");// Get unique categories
        // console.log(categories)
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

export const getProductsInCategory = async (req, res) => {
    try {
        /*
        // if using query params 
        // const { name } = req.query; // Extract category from query params
        // if (!name) {
        //     return res.status(400).json({ success: false, message: "Category is required" });
        // }
        // console.log("Category received:", name); // Debugging
*/

        const { page = 1, limit = 10 } = req.query;  // Default to page 1 and limit 10
        // Calculate skip based on page number and limit
        const skip = (page - 1) * limit;

        const category = decodeURIComponent(req.params.category);
        // Fetch products with pagination (skip and limit)
        const products = await Product.find({ category })
            .skip(skip)  // Skip products based on current page
            .limit(Number(limit));  // Limit the number of products per page
        ;

        // Get total number of products for pagination
        const totalProducts = await Product.countDocuments({ category });

        if (!products.length) {
            return res.status(404).json({ success: false, message: "No products found in this category" });
        }

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                limit: Number(limit),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getProductsBySearch = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        // Check if search query is provided
        if (!search) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        // Calculate skip based on the current page and limit
        const skip = (page - 1) * limit;

        // Search products by name or description (case-insensitive)
        const products = await Product.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },

            ]
        })
            .skip(skip) // Skip the results based on page number
            .limit(Number(limit)); // Limit the number of results per page

        // Get the total count of products for pagination
        const totalProducts = await Product.countDocuments({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
            ]
        });

        // If no products found
        if (!products.length) {
            return res.status(200).json({
                success: true,
                products: [],
                pagination: {
                    currentPage: Number(page),
                    totalPages: 0,
                    totalProducts: 0,
                    limit: Number(limit),
                },
                message: "No products found matching your search"
            });
        }

        // Return products and pagination info (total pages, current page, etc.)
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                limit: Number(limit),
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}