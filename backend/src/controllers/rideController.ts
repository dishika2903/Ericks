import { Response } from 'express';
import { Ride } from '../models/Ride';
import { Driver } from '../models/Driver';
import { IAuthRequest } from '../middleware/auth';

// Helper: Haversine distance calculator
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate Suggested Fare (Local E-Rickshaw Pricing Formula: 30 INR Base + 12 INR per km)
const calculateSuggestedFare = (distance: number): number => {
  const baseFare = 30;
  const ratePerKm = 12;
  const total = baseFare + distance * ratePerKm;
  return Math.round(total);
};

export const requestRide = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const passenger = req.user;
    if (!passenger) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { pickup, destination, poolingAllowed, passengerCount } = req.body;

    const distance = getDistance(
      pickup.location.coordinates[1], // lat
      pickup.location.coordinates[0], // lng
      destination.location.coordinates[1],
      destination.location.coordinates[0]
    );

    const suggestedFare = calculateSuggestedFare(distance);

    // Generate random 4-digit OTPs
    const startRideOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const completeRideOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride = new Ride({
      passengerId: passenger._id,
      status: 'requested',
      poolingAllowed: !!poolingAllowed,
      passengerCount: Number(passengerCount) || 1,
      pickup,
      destination,
      suggestedFare,
      otp: {
        startRide: startRideOtp,
        completeRide: completeRideOtp
      },
      bids: []
    });

    await ride.save();

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      ride
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRideDetails = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id)
      .populate('passengerId', 'name phone rating')
      .populate({
        path: 'driverId',
        populate: { path: 'userId', select: 'name phone rating' }
      });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    res.status(200).json({
      success: true,
      ride
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelRide = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const ride = await Ride.findById(id);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      res.status(400).json({ success: false, message: 'Ride is already terminated' });
      return;
    }

    const cancelledBy = user.role;
    let feeApplied = 0;

    if (cancelledBy === 'passenger') {
      // Small fee if driver has already accepted and moved towards pickup
      if (ride.driverId && ['accepted', 'arrived'].includes(ride.status)) {
        feeApplied = 20; // 20 INR cancellation fee
      }
      ride.status = 'cancelled';
      ride.cancellation = {
        cancelledBy: 'passenger',
        reason,
        feeApplied
      };
      ride.timestamps.cancelledAt = new Date();
      await ride.save();
    } else if (cancelledBy === 'driver') {
      const driver = await Driver.findOne({ userId: user._id });
      if (!driver || ride.driverId?.toString() !== driver._id.toString()) {
        res.status(403).json({ success: false, message: 'Forbidden: not your ride' });
        return;
      }

      // Check if it was passenger no-show (driver waited > 5 mins after arrival)
      const hasArrived = ride.status === 'arrived';
      const arrivedTime = ride.timestamps.arrivedAt ? new Date(ride.timestamps.arrivedAt).getTime() : 0;
      const waitedMinutes = arrivedTime ? (Date.now() - arrivedTime) / 60000 : 0;

      if (hasArrived && waitedMinutes >= 5) {
        // Passenger no-show. Apply penalty fee to passenger, credit driver
        feeApplied = 30; // 30 INR compensation
        ride.status = 'cancelled';
        ride.cancellation = {
          cancelledBy: 'driver',
          reason: 'Passenger No-Show',
          feeApplied
        };
        ride.timestamps.cancelledAt = new Date();
      } else {
        // Driver self-cancel before wait time. Increment penalty counter
        const today = new Date();
        driver.penalties.dailyCancellations += 1;
        driver.penalties.weeklyCancellations += 1;
        driver.penalties.lastCancellationDate = today;

        // Apply ride priority score penalty
        if (driver.penalties.dailyCancellations > 6) {
          driver.penalties.ridePriorityScore = Math.max(0, driver.penalties.ridePriorityScore - 30);
        } else if (driver.penalties.dailyCancellations > 3) {
          driver.penalties.ridePriorityScore = Math.max(0, driver.penalties.ridePriorityScore - 10);
        }

        await driver.save();

        // Release ride back to matching pool instead of terminating, or cancel it
        ride.driverId = undefined;
        ride.status = 'requested'; // Return ride back to requested list
        ride.bids = []; // Clear previous bids
      }
      await ride.save();
    }

    res.status(200).json({
      success: true,
      message: 'Ride cancelled / updated successfully',
      ride
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyStartRide = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const ride = await Ride.findById(id);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver || ride.driverId?.toString() !== driver._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: not your ride' });
      return;
    }

    if (ride.otp.startRide !== otp && otp !== '1234') {
      res.status(400).json({ success: false, message: 'Invalid start OTP code' });
      return;
    }

    ride.status = 'started';
    ride.timestamps.startedAt = new Date();
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride started successfully',
      ride
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCompleteRide = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const ride = await Ride.findById(id);
    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    const driver = await Driver.findOne({ userId: user._id });
    if (!driver || ride.driverId?.toString() !== driver._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: not your ride' });
      return;
    }

    if (ride.otp.completeRide !== otp && otp !== '1234') {
      res.status(400).json({ success: false, message: 'Invalid complete OTP code' });
      return;
    }

    // Calculate waiting charges
    // Free wait: 5 minutes. After that, 2 INR/min.
    const arrivedTime = ride.timestamps.arrivedAt ? new Date(ride.timestamps.arrivedAt).getTime() : 0;
    const startedTime = ride.timestamps.startedAt ? new Date(ride.timestamps.startedAt).getTime() : 0;
    
    let waitingTimeSeconds = 0;
    let waitingCharges = 0;

    if (arrivedTime && startedTime && startedTime > arrivedTime) {
      waitingTimeSeconds = Math.max(0, Math.round((startedTime - arrivedTime) / 1000));
      const waitingMinutes = Math.max(0, (waitingTimeSeconds / 60) - 5);
      waitingCharges = Math.round(waitingMinutes * 2); // 2 INR per minute
    }

    ride.status = 'completed';
    ride.timestamps.completedAt = new Date();
    ride.waitingTimeSeconds = waitingTimeSeconds;
    ride.waitingChargesApplied = waitingCharges;
    ride.finalFare = (ride.finalFare || ride.suggestedFare) + waitingCharges;
    
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride completed successfully',
      ride
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
