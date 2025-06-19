import express from 'express';

import { registerUser, loginUser, getAllUsers, getUserProfile } from '../controllers/authController.js';
import { isAdmin, protect } from '../middlewares/authMiddleware.js';
import { validateLogin, validateRegister } from '../middlewares/validationUser.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser)
router.post('/login', validateLogin, loginUser)

// if we using cookies instead of localStorage
// router.post("/logout", logoutUser);


//  Admin-only route to get all users
router.get("/", protect, isAdmin, getAllUsers);
// each user can view his profile
router.get("/profile", protect, getUserProfile);

export default router;