import { Response } from 'express';
import { User } from '../models/User';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { Complaint } from '../models/Complaint';
import { SOSAlert } from '../models/SOSAlert';
import { IAuthRequest } from '../middleware/auth';

export const getPendingDrivers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const drivers = await Driver.find({ verificationStatus: 'pending_verification' })
      .populate('userId', 'name phone email');

    res.status(200).json({
      success: true,
      drivers
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDriver = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid verification status' });
      return;
    }

    const driver = await Driver.findById(id);
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.verificationStatus = status;
    if (status === 'rejected') {
      driver.rejectionReason = rejectionReason || 'Documents rejected';
    } else {
      driver.rejectionReason = '';
    }

    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver status successfully updated to ${status}`,
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userCount = await User.countDocuments({ role: 'passenger' });
    const driverCount = await Driver.countDocuments({ verificationStatus: 'verified' });
    const pendingDrivers = await Driver.countDocuments({ verificationStatus: 'pending_verification' });

    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });

    // Aggregate total revenue from completed rides
    const revenueAggregate = await Ride.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalFare' } } }
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

    const openComplaintsCount = await Complaint.countDocuments({ status: 'open' });
    const activeSOSCount = await SOSAlert.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      analytics: {
        users: userCount,
        drivers: {
          verified: driverCount,
          pending: pendingDrivers
        },
        rides: {
          total: totalRides,
          completed: completedRides,
          cancelled: cancelledRides
        },
        totalRevenue,
        openComplaints: openComplaintsCount,
        activeSOSAlerts: activeSOSCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaints = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const complaints = await Complaint.find()
      .populate('reporterId', 'name phone role')
      .populate('reportedUserId', 'name phone role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveComplaint = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolutionDetails } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }

    complaint.status = 'resolved';
    complaint.resolutionDetails = resolutionDetails || 'Resolved by admin';
    complaint.resolvedAt = new Date();
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint marked as resolved',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSOSAlerts = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const alerts = await SOSAlert.find()
      .populate('userId', 'name phone role')
      .populate('rideId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveSOSAlert = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const admin = req.user;

    const alert = await SOSAlert.findById(id);
    if (!alert) {
      res.status(404).json({ success: false, message: 'SOS Alert not found' });
      return;
    }

    alert.status = 'resolved';
    alert.resolutionNotes = resolutionNotes || 'Emergency services contacted / issue resolved';
    alert.resolvedBy = admin?._id as any;
    alert.resolvedAt = new Date();
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert resolved successfully',
      alert
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
