import User from "../models/User.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;

        // --------first way to validate the email and password---------
        //  // Email validation using regex
        //  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        //  if (!emailRegex.test(email)) {
        //      return res.status(400).json({ success: false, message: "Invalid email format" });
        //  }

        //  // Password validation (at least 8 chars, 1 uppercase, 1 number, 1 special character)
        //  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        //  if (!passwordRegex.test(password)) {
        //      return res.status(400).json({
        //           success: false, message: "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
        //      });
        //  }

        // Check if user already exists

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword, // Stored but not returned
            isAdmin: isAdmin || false,
        });
        const token = jwt.sign({ userId: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" })

        // Store token in HttpOnly cookie (more secure)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only for HTTPS in production
            sameSite: "Strict",
        });

        // Send only necessary user data in response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: token,
            // user: {
            //     _id: newUser._id,
            //     name: newUser.name,
            //     email: newUser.email,
            //     isAdmin: newUser.isAdmin,
            //     token, // Send token with user data
            // },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exist
        const user = await User.findOne({ email });
        // console.log(user)
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" })

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" })

        // Store token in HttpOnly cookie (more secure)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only for HTTPS in production
            sameSite: "Strict",
        });

        res.status(200).json({
            success: true, message: "Login successful",
            token: token,
            // user: {
            //     _id: user._id,
            //     name: user.name,
            //     email: user.email,
            //     isAdmin: user.isAdmin,
            //     token, // Send token with user data
            // },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");// Exclude password for security
        // console.log(users[0])
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        // console.log('profile', req.user.id);
        // console.log('profile', req.user._id);
        const user = await User.findById(req.user.id).select("-password");
        // console.log(user)
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// if we using cookies instead of localStorage
// export const logoutUser = async (req, res) => {
//     res.cookie("token", "", { expires: new Date(0) });
//     res.status(200).json({ success: true, message: "Logged out successfully" });
// };
