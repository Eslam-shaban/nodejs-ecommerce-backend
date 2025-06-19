import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
// Middleware to protect routes (Only logged-in users can access)
export const protect = async (req, res, next) => {

    const token = req.headers.authorization?.split(" ")[1]; // Get token from headers
    // console.log("bk token", token)
    // if we using cookies instead of localStorage
    // const token = req.cookies.token;
    // console.log("Token from cookies:", req.cookies.token);

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    try {
        // console.log(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        const user = await User.findById(decoded.userId).select("-password");// Exclude password
        // console.log(user);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        // 401:Not authorized: Not authenticated	
        res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
};
// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        // 403:Forbidden: Authenticated, but no permission
        res.status(403).json({ success: false, message: "Not authorized, admin access required" });
    }
}