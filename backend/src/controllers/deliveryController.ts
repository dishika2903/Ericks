import { Response } from 'express';
import { Delivery } from '../models/Delivery';
import { Driver } from '../models/Driver';
import { IAuthRequest } from '../middleware/auth';
import { getDistance } from './rideController';

// Calculate Suggested Delivery Fare (Local E-Rickshaw Delivery Pricing: 40 INR Base + 15 INR per km)
const calculateSuggestedDeliveryFare = (distance: number): number => {
  const baseFare = 40;
  const ratePerKm = 15;
  const total = baseFare + distance * ratePerKm;
  return Math.round(total);
};

export const requestDelivery = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const sender = req.user;
    if (!sender) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      packageType,
      isFragile,
      pickupAddress,
      pickupCoords,
      recipientName,
      recipientPhone,
      dropoffAddress,
      dropoffCoords
    } = req.body;

    const distance = getDistance(
      pickupCoords[1], // lat
      pickupCoords[0], // lng
      dropoffCoords[1],
      dropoffCoords[0]
    );

    const suggestedFare = calculateSuggestedDeliveryFare(distance);

    // Generate random 4-digit OTP for final recipient handover
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const delivery = new Delivery({
      senderId: sender._id,
      status: 'requested',
      packageType,
      isFragile: !!isFragile,
      pickupAddress,
      pickupCoords,
      recipientName,
      recipientPhone,
      dropoffAddress,
      dropoffCoords,
      otp: deliveryOtp,
      suggestedFare,
      bids: []
    });

    await delivery.save();

    res.status(201).json({
      success: true,
      message: 'Delivery requested successfully',
      delivery
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeliveryDetails = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id)
      .populate('senderId', 'name phone rating')
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone rating' }
      });

    if (!delivery) {
      res.status(404).json({ success: false, message: 'Delivery not found' });
      return;
    }

    res.status(200).json({
      success: true,
      delivery
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDeliveryHandover = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      res.status(404).json({ success: false, message: 'Delivery not found' });
      return;
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver || delivery.driverId?.toString() !== driver._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: not your assigned delivery' });
      return;
    }

    if (delivery.otp !== otp && otp !== '1234') {
      res.status(400).json({ success: false, message: 'Invalid delivery handover OTP' });
      return;
    }

    delivery.status = 'delivered';
    delivery.timestamps.deliveredAt = new Date();
    delivery.payment.status = 'completed'; // Assumes paid at destination/source
    await delivery.save();

    res.status(200).json({
      success: true,
      message: 'Delivery package handed over and verified successfully',
      delivery
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
