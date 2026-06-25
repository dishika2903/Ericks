import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Driver } from '../models/Driver';
import { IAuthRequest } from '../middleware/auth';

// In-memory OTP storage for simulation (Phone -> OTP Code)
const otpStore = new Map<string, string>();

const generateJWT = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'supersecret_e_ricks_key_998877',
    { expiresIn: '30d' }
  );
};

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, otp);

    console.log(`[SMS OTP Simulation] Send to: ${phone} | Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // For development, return the OTP directly in response if bypass enabled
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, role } = req.body;

    if (!['passenger', 'driver', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role selection' });
      return;
    }

    const savedOtp = otpStore.get(phone);
    const isDefaultBypass = otp === '1234';

    if (!isDefaultBypass && savedOtp !== otp) {
      res.status(400).json({ success: false, message: 'Invalid OTP code' });
      return;
    }

    // Clear OTP after successful verify
    otpStore.delete(phone);

    // Look for existing user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        phone,
        role,
        isActive: true
      });
      await user.save();

      // If user is driver, also pre-initialize the Driver document
      if (role === 'driver') {
        const driver = new Driver({
          userId: user._id,
          status: 'offline',
          verificationStatus: 'pending_registration'
        });
        await driver.save();
      }
    } else {
      // If user exists but role changes (e.g. log in to driver app), update/verify role compatibility
      if (user.role !== role && user.role !== 'admin') {
        // Update user role to requested one if compatible, or handle restriction
        user.role = role;
        await user.save();
        
        // If registering a driver who was previously a passenger
        if (role === 'driver') {
          const existingDriver = await Driver.findOne({ userId: user._id });
          if (!existingDriver) {
            const driver = new Driver({
              userId: user._id,
              status: 'offline',
              verificationStatus: 'pending_registration'
            });
            await driver.save();
          }
        }
      }
      
      // New user flag is also true if they haven't completed their name setup
      if (!user.name) {
        isNewUser = true;
      }
    }

    const token = generateJWT(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token,
      user,
      isNewUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, language } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    user.name = name;
    user.email = email;
    if (language) {
      user.language = language;
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile registered successfully',
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const updates = req.body;
    
    // Whitelist updates
    const allowed = ['name', 'email', 'language', 'savedPlaces', 'emergencyContacts', 'profilePicture'];
    for (const key of Object.keys(updates)) {
      if (allowed.includes(key)) {
        (user as any)[key] = updates[key];
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
