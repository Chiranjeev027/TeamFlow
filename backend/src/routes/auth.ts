// teamflow/backend/src/routes/Auth.ts
import express from 'express';
import { register, login, getMe, updateProfile, changePassword, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRegistration, handleValidationErrors } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';

const router = express.Router();

router.post('/register', authLimiter, validateRegistration, handleValidationErrors, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;