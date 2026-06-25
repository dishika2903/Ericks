import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { Delivery } from '../models/Delivery';
import { SOSAlert } from '../models/SOSAlert';

let io: Server;

// Map to track active sockets to user IDs
const activeConnections = new Map<string, string>(); // socketId -> userId

export const initializeSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware for Sockets
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_e_ricks_key_998877') as { userId: string; role: string };
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Store user details in socket
      socket.data = { userId: user._id.toString(), role: user.role };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    activeConnections.set(socket.id, userId);
    
    // Join a private room unique to this user
    socket.join(`user:${userId}`);

    // If driver, also join driver room and find if there is an associated Driver profile
    let driverProfileId = '';
    if (role === 'driver') {
      socket.join('drivers:active');
      Driver.findOne({ userId }).then(driver => {
        if (driver) {
          driverProfileId = driver._id.toString();
          socket.join(`driver:${driverProfileId}`);
          console.log(`[Socket] Driver connected: ${userRoomName(driverProfileId)} (Profile ID)`);
        }
      });
    }

    console.log(`[Socket] Connected: ${role} | User: ${userId} | Socket: ${socket.id}`);

    // 1. Geolocation Updates (Driver -> Server)
    socket.on('location:update', async (data: { latitude: number; longitude: number; heading?: number; batteryLevel?: number }) => {
      try {
        if (role !== 'driver' || !driverProfileId) return;

        const { latitude, longitude, batteryLevel } = data;

        // Update driver location in DB
        const driver = await Driver.findById(driverProfileId);
        if (driver) {
          driver.location = {
            type: 'Point',
            coordinates: [longitude, latitude]
          };
          driver.status = 'online'; // Automatically make online if updating coordinates
          if (batteryLevel !== undefined && driver.vehicle) {
            driver.vehicle.batteryLevel = batteryLevel;
          }
          await driver.save();
        }

        // Broadcast location updates to passengers of active rides assigned to this driver
        const activeRides = await Ride.find({
          driverId: driverProfileId,
          status: { $in: ['accepted', 'arrived', 'started'] }
        });

        for (const ride of activeRides) {
          io.to(`user:${ride.passengerId.toString()}`).emit('location:driver_moved', {
            rideId: ride._id,
            latitude,
            longitude,
            heading: data.heading || 0
          });
        }
      } catch (err: any) {
        console.error(`[Socket Location Error]: ${err.message}`);
      }
    });

    // 2. Ride Request Broadcast Setup (Passenger Client triggers after saving ride)
    socket.on('ride:request', async (data: { rideId: string }) => {
      try {
        const { rideId } = data;
        const ride = await Ride.findById(rideId).populate('passengerId', 'name rating phone');
        if (!ride || ride.status !== 'requested') return;

        // Find nearest 4-6 online drivers using GeoJSON coordinates query
        const nearestDrivers = await Driver.find({
          status: 'online',
          verificationStatus: 'verified',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: ride.pickup.location.coordinates
              },
              $maxDistance: 5000 // 5km search radius
            }
          }
        }).limit(6);

        console.log(`[Socket] Broadcast ride ${rideId} to ${nearestDrivers.length} nearby drivers.`);

        nearestDrivers.forEach(driver => {
          io.to(`driver:${driver._id.toString()}`).emit('ride:broadcast_request', {
            rideId: ride._id,
            pickupAddress: ride.pickup.address,
            destinationAddress: ride.destination.address,
            suggestedFare: ride.suggestedFare,
            passengerName: (ride.passengerId as any).name || 'Passenger',
            passengerRating: (ride.passengerId as any).rating || 5.0,
            poolingAllowed: ride.poolingAllowed
          });
        });
      } catch (err: any) {
        console.error(`[Socket Ride Request Error]: ${err.message}`);
      }
    });

    // 3. Driver Bids on Ride Request
    socket.on('ride:submit_bid', async (data: { rideId: string; fareOffer: number; etaMinutes: number }) => {
      try {
        if (role !== 'driver' || !driverProfileId) {
          socket.emit('error', { message: 'Only verified drivers can submit bids' });
          return;
        }

        const { rideId, fareOffer, etaMinutes } = data;
        const ride = await Ride.findById(rideId);
        
        if (!ride) {
          socket.emit('error', { message: 'Ride not found' });
          return;
        }

        if (ride.status !== 'requested' && ride.status !== 'bidding') {
          socket.emit('error', { message: 'Ride is no longer open for bidding' });
          return;
        }

        // Business Rule: Bid offer must be within range (e.g. suggestedFare +/- 20%)
        const suggested = ride.suggestedFare;
        const minAllowed = suggested * 0.8;
        const maxAllowed = suggested * 1.2;

        if (fareOffer < minAllowed || fareOffer > maxAllowed) {
          socket.emit('error', {
            message: `Fare offer must be between INR ${Math.round(minAllowed)} and INR ${Math.round(maxAllowed)}`
          });
          return;
        }

        // Check if driver has already bid
        const existingBidIndex = ride.bids.findIndex(b => b.driverId.toString() === driverProfileId);
        if (existingBidIndex !== -1) {
          ride.bids[existingBidIndex].fareOffer = fareOffer;
          ride.bids[existingBidIndex].etaMinutes = etaMinutes;
          ride.bids[existingBidIndex].timestamp = new Date();
        } else {
          ride.bids.push({
            driverId: driverProfileId as any,
            fareOffer,
            etaMinutes,
            timestamp: new Date(),
            status: 'pending'
          });
        }

        if (ride.status === 'requested') {
          ride.status = 'bidding';
        }
        await ride.save();

        // Populate driver info for passenger update
        const driverDoc = await Driver.findById(driverProfileId).populate('userId', 'name profilePicture rating');
        
        io.to(`user:${ride.passengerId.toString()}`).emit('ride:bid_received', {
          rideId: ride._id,
          bid: {
            driverId: driverProfileId,
            driverName: (driverDoc?.userId as any)?.name || 'Driver',
            driverRating: driverDoc?.userId ? (driverDoc.userId as any).rating : 5.0,
            vehiclePlate: driverDoc?.vehicle?.plateNumber || '',
            fareOffer,
            etaMinutes
          }
        });

        // Business Rule: Bids expire after 30 seconds
        setTimeout(async () => {
          try {
            const currentRide = await Ride.findById(rideId);
            if (currentRide && currentRide.status === 'bidding') {
              const bid = currentRide.bids.find(
                b => b.driverId.toString() === driverProfileId && b.status === 'pending'
              );
              if (bid) {
                bid.status = 'expired';
                await currentRide.save();
                io.to(`user:${currentRide.passengerId.toString()}`).emit('ride:bid_expired', {
                  rideId,
                  driverId: driverProfileId
                });
                io.to(`driver:${driverProfileId}`).emit('ride:bid_expired_driver', { rideId });
              }
            }
          } catch (e) {
            console.error('Error handling bid expiry timeout', e);
          }
        }, 30000);

      } catch (err: any) {
        console.error(`[Socket Submit Bid Error]: ${err.message}`);
      }
    });

    // 4. Passenger Selects / Accepts Driver Bid
    socket.on('ride:accept_bid', async (data: { rideId: string; driverId: string }) => {
      try {
        const { rideId, driverId } = data;
        const ride = await Ride.findById(rideId);
        
        if (!ride || (ride.status !== 'requested' && ride.status !== 'bidding')) {
          socket.emit('error', { message: 'Ride is no longer available' });
          return;
        }

        const selectedBid = ride.bids.find(
          b => b.driverId.toString() === driverId && (b.status === 'pending' || b.status === 'expired') // Allow accepting slightly expired bid if passenger wants to
        );

        if (!selectedBid) {
          socket.emit('error', { message: 'Selected bid details not found' });
          return;
        }

        // Set accepted driver details
        ride.driverId = driverId as any;
        ride.finalFare = selectedBid.fareOffer;
        ride.status = 'accepted';
        ride.timestamps.acceptedAt = new Date();

        // Expire all other bids
        ride.bids.forEach(b => {
          if (b.driverId.toString() !== driverId) {
            b.status = 'expired';
          } else {
            b.status = 'accepted';
          }
        });

        await ride.save();

        // Notify chosen driver
        io.to(`driver:${driverId}`).emit('ride:bid_accepted', {
          rideId: ride._id,
          pickupLocation: ride.pickup,
          destinationLocation: ride.destination,
          finalFare: ride.finalFare,
          otp: ride.otp.startRide
        });

        // Notify other drivers bid is closed
        ride.bids.forEach(b => {
          if (b.driverId.toString() !== driverId) {
            io.to(`driver:${b.driverId.toString()}`).emit('ride:broadcast_cancelled', { rideId });
          }
        });

        // Send full status update back to passenger
        io.to(`user:${ride.passengerId.toString()}`).emit('ride:status_changed', {
          rideId: ride._id,
          status: 'accepted',
          driverId,
          finalFare: ride.finalFare
        });

      } catch (err: any) {
        console.error(`[Socket Accept Bid Error]: ${err.message}`);
      }
    });

    // 5. Driver Arrived at Pickup Point
    socket.on('ride:driver_arrived', async (data: { rideId: string }) => {
      try {
        if (role !== 'driver') return;
        const { rideId } = data;
        const ride = await Ride.findById(rideId);
        
        if (!ride || ride.status !== 'accepted') return;

        ride.status = 'arrived';
        ride.timestamps.arrivedAt = new Date();
        await ride.save();

        // Notify passenger
        io.to(`user:${ride.passengerId.toString()}`).emit('ride:status_changed', {
          rideId: ride._id,
          status: 'arrived'
        });
      } catch (err: any) {
        console.error(`[Socket Driver Arrived Error]: ${err.message}`);
      }
    });

    // 6. SOS Emergency Trigger (Passenger or Driver)
    socket.on('sos:trigger', async (data: { rideId: string; latitude: number; longitude: number }) => {
      try {
        const { rideId, latitude, longitude } = data;

        const sos = new SOSAlert({
          rideId,
          userId,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          status: 'active'
        });
        await sos.save();

        // Broadcast to Admin Dashboard channels
        io.to('admins:active').emit('sos:alert_received', {
          sosId: sos._id,
          rideId,
          userId,
          role,
          location: [longitude, latitude],
          timestamp: sos.createdAt
        });

        // Echo back confirmation to sender
        socket.emit('sos:status', { success: true, message: 'SOS registered. Admin and local emergency support notified.' });
      } catch (err: any) {
        console.error(`[Socket SOS Trigger Error]: ${err.message}`);
      }
    });

    // Admin Joining Dashboard Channel
    socket.on('admin:join', () => {
      if (role === 'admin') {
        socket.join('admins:active');
        console.log(`[Socket] Admin joined monitoring room: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket.id);
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

const userRoomName = (driverProfileId: string) => `driver:${driverProfileId}`;
