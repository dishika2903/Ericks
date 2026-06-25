import { Response } from 'express';
import { Driver } from '../models/Driver';
import { IAuthRequest } from '../middleware/auth';

export const uploadDocuments = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      aadhaarNumber,
      aadhaarUrl,
      licenseNumber,
      licenseUrl,
      vehicleRcNumber,
      vehicleRcUrl,
      vehiclePhotoUrl,
      selfieUrl
    } = req.body;

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.documents = {
      aadhaarNumber: aadhaarNumber || driver.documents.aadhaarNumber,
      aadhaarUrl: aadhaarUrl || driver.documents.aadhaarUrl,
      licenseNumber: licenseNumber || driver.documents.licenseNumber,
      licenseUrl: licenseUrl || driver.documents.licenseUrl,
      vehicleRcNumber: vehicleRcNumber || driver.documents.vehicleRcNumber,
      vehicleRcUrl: vehicleRcUrl || driver.documents.vehicleRcUrl,
      vehiclePhotoUrl: vehiclePhotoUrl || driver.documents.vehiclePhotoUrl,
      selfieUrl: selfieUrl || driver.documents.selfieUrl
    };

    // Transition status to verification pending once core items are submitted
    if (driver.documents.aadhaarUrl && driver.documents.licenseUrl && driver.documents.vehicleRcUrl && driver.documents.selfieUrl) {
      driver.verificationStatus = 'pending_verification';
    }

    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVehicle = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { make, model, plateNumber, capacity, isClosedBody } = req.body;

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.vehicle = {
      make,
      model,
      plateNumber,
      capacity: Number(capacity) || 4,
      batteryLevel: driver.vehicle?.batteryLevel ?? 100,
      isClosedBody: !!isClosedBody
    };

    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle information updated successfully',
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status } = req.body;
    if (!['offline', 'online', 'break'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    // Block going online if driver is not verified yet
    if (status === 'online' && driver.verificationStatus !== 'verified') {
      res.status(400).json({
        success: false,
        message: `Status cannot be online. Verification state is: ${driver.verificationStatus}`
      });
      return;
    }

    driver.status = status as 'offline' | 'online' | 'break';
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver status updated to ${status}`,
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { longitude, latitude, batteryLevel } = req.body;

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver profile not found' });
      return;
    }

    driver.location = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)]
    };

    if (batteryLevel !== undefined) {
      if (driver.vehicle) {
        driver.vehicle.batteryLevel = Math.max(0, Math.min(100, Number(batteryLevel)));
      }
    }

    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Location and battery updated successfully',
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriverDetails = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const driver = await Driver.findOne({ userId: user._id }).populate('userId', 'name phone rating');
    if (!driver) {
      res.status(404).json({ success: false, message: 'Driver details not found' });
      return;
    }

    res.status(200).json({
      success: true,
      driver
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
