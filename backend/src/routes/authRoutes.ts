import { Router } from 'express';
import { sendOTP, verifyOTP, registerProfile, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateFields } from '../middleware/validator';

const router = Router();

router.post('/send-otp', validateFields(['phone']), sendOTP);
router.post('/verify-otp', validateFields(['phone', 'otp', 'role']), verifyOTP);

// Protected Profile routes
router.post('/register', authenticate, validateFields(['name']), registerProfile);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
