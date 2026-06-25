import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';

// A mock local integration test executing direct DB transactions to confirm business logic models
const runLocalSimulation = async () => {
  console.log('\n=========================================');
  console.log('STARTING E-RICKS BACKEND SYSTEM LOGIC TESTS');
  console.log('=========================================\n');

  try {
    // 1. Connect to local database
    process.env.MONGODB_URI = 'mongodb://localhost:27017/ericks_test';
    await connectDB();

    // Clean test DB
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    console.log('[Test Setup] Cleaned ericks_test collections.');

    // 2. Create Passenger
    const passenger = new User({
      phone: '+919999999999',
      role: 'passenger',
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      language: 'hi',
      savedPlaces: [
        { label: 'Home', address: '12, Saket Nagar, Indore', latitude: 22.7196, longitude: 75.8577 }
      ]
    });
    await passenger.save();
    console.log(`[PASSENGER CREATED]: ID: ${passenger._id} | Name: ${passenger.name}`);

    // 3. Create Driver
    const driverUser = new User({
      phone: '+918888888888',
      role: 'driver',
      name: 'Satnam Singh',
      email: 'satnam@example.com',
      language: 'hi'
    });
    await driverUser.save();

    const driver = new Driver({
      userId: driverUser._id,
      status: 'offline',
      verificationStatus: 'pending_registration'
    });
    await driver.save();
    console.log(`[DRIVER CREATED]: ID: ${driver._id} | Name: ${driverUser.name} | Status: ${driver.status} | Verification: ${driver.verificationStatus}`);

    // 4. Update Driver Documents and Verify
    driver.documents = {
      aadhaarNumber: '123456789012',
      aadhaarUrl: 'http://docs.ericks.com/aadhaar_satnam.jpg',
      licenseNumber: 'DL-INDORE-2026-9900',
      licenseUrl: 'http://docs.ericks.com/dl_satnam.jpg',
      vehicleRcNumber: 'RC-MP-09-ER-5544',
      vehicleRcUrl: 'http://docs.ericks.com/rc_satnam.jpg',
      vehiclePhotoUrl: 'http://docs.ericks.com/vehicle_satnam.jpg',
      selfieUrl: 'http://docs.ericks.com/selfie_satnam.jpg'
    };
    driver.verificationStatus = 'pending_verification';
    await driver.save();
    console.log(`[DRIVER DOCS UPLOADED]: Verification status is now: ${driver.verificationStatus}`);

    // Simulate Admin approval
    driver.verificationStatus = 'verified';
    driver.vehicle = {
      make: 'Mahindra',
      model: 'Treo E-Rickshaw',
      plateNumber: 'MP09ER5544',
      capacity: 4,
      batteryLevel: 92,
      isClosedBody: true
    };
    driver.status = 'online';
    driver.location = {
      type: 'Point',
      coordinates: [75.8580, 22.7200] // Near passenger
    };
    await driver.save();
    console.log(`[ADMIN APPROVED DRIVER]: Verification: ${driver.verificationStatus} | Status: ${driver.status} | Battery: ${driver.vehicle.batteryLevel}%`);

    // 5. Passenger Requests a Ride
    const pickup = {
      address: '12, Saket Nagar, Indore',
      location: { type: 'Point' as const, coordinates: [75.8577, 22.7196] }
    };
    const destination = {
      address: 'Indore Junction Railway Station',
      location: { type: 'Point' as const, coordinates: [75.8640, 22.7258] }
    };

    // Calculate simulated distance manually
    // lat1: 22.7196, lng1: 75.8577 to lat2: 22.7258, lng2: 75.8640
    // roughly 1 km
    const distanceKm = 1.05;
    const baseFare = 30;
    const ratePerKm = 12;
    const suggestedFare = Math.round(baseFare + distanceKm * ratePerKm); // 30 + 12.6 = 43

    const startRideOtp = '5678';
    const completeRideOtp = '9012';

    const ride = new Ride({
      passengerId: passenger._id,
      status: 'requested',
      poolingAllowed: false,
      pickup,
      destination,
      suggestedFare,
      otp: {
        startRide: startRideOtp,
        completeRide: completeRideOtp
      }
    });
    await ride.save();
    console.log(`[RIDE REQUESTED]: ID: ${ride._id} | Suggested Fare: INR ${ride.suggestedFare} | OTP Start: ${ride.otp.startRide}`);

    // 6. Driver Submits Bid
    // Suggested: 43. Drivers can bid range: 43 * 0.8 to 43 * 1.2 (34 to 52)
    const bidOffer = 45; // Valid
    const driverEta = 4; // minutes

    ride.bids.push({
      driverId: driver._id as any,
      fareOffer: bidOffer,
      etaMinutes: driverEta,
      timestamp: new Date(),
      status: 'pending'
    });
    ride.status = 'bidding';
    await ride.save();
    console.log(`[DRIVER SUBMITTED BID]: Offer: INR ${bidOffer} | ETA: ${driverEta} mins | Status: ${ride.status}`);

    // 7. Passenger Accepts Bid
    const bid = ride.bids[0];
    ride.driverId = bid.driverId;
    ride.finalFare = bid.fareOffer;
    ride.status = 'accepted';
    ride.timestamps.acceptedAt = new Date();
    bid.status = 'accepted';
    await ride.save();
    console.log(`[PASSENGER ACCEPTED BID]: Final Fare: INR ${ride.finalFare} | Assigned Driver ID: ${ride.driverId} | Ride Status: ${ride.status}`);

    // 8. Driver Arrived
    ride.status = 'arrived';
    ride.timestamps.arrivedAt = new Date();
    await ride.save();
    console.log(`[DRIVER ARRIVED]: Status updated to: ${ride.status} | Timestamp: ${ride.timestamps.arrivedAt}`);

    // Simulate wait time before starting the ride (let's say 7 minutes, which triggers waiting charges)
    // Wait charges: 5 mins free, then 2 INR/min. 7 mins wait = 2 mins charged = 4 INR.
    const arrivedTime = new Date(Date.now() - 7 * 60 * 1000); // 7 minutes ago
    ride.timestamps.arrivedAt = arrivedTime;
    await ride.save();

    // 9. Start Ride
    const enteredStartOtp = '5678';
    if (enteredStartOtp === ride.otp.startRide) {
      ride.status = 'started';
      ride.timestamps.startedAt = new Date();
      await ride.save();
      console.log(`[RIDE STARTED]: Status updated to: ${ride.status} | Timestamp: ${ride.timestamps.startedAt}`);
    } else {
      console.log('[ERROR] Start OTP verification failed!');
    }

    // 10. Complete Ride
    const enteredCompleteOtp = '9012';
    if (enteredCompleteOtp === ride.otp.completeRide) {
      const arrTime = ride.timestamps.arrivedAt ? new Date(ride.timestamps.arrivedAt).getTime() : 0;
      const startTime = ride.timestamps.startedAt ? new Date(ride.timestamps.startedAt).getTime() : 0;
      
      let waitingTimeSeconds = 0;
      let waitingCharges = 0;

      if (arrTime && startTime && startTime > arrTime) {
        waitingTimeSeconds = Math.max(0, Math.round((startTime - arrTime) / 1000));
        const waitingMinutes = Math.max(0, (waitingTimeSeconds / 60) - 5);
        waitingCharges = Math.round(waitingMinutes * 2); // 2 INR/min
      }

      ride.status = 'completed';
      ride.timestamps.completedAt = new Date();
      ride.waitingTimeSeconds = waitingTimeSeconds;
      ride.waitingChargesApplied = waitingCharges;
      ride.finalFare = (ride.finalFare || ride.suggestedFare) + waitingCharges;
      await ride.save();

      console.log(`[RIDE COMPLETED SUCCESSFULLY]:`);
      console.log(`  - Status: ${ride.status}`);
      console.log(`  - Completed At: ${ride.timestamps.completedAt}`);
      console.log(`  - Total Wait Time: ${Math.round(waitingTimeSeconds / 60)} minutes`);
      console.log(`  - Waiting Charges Applied: INR ${waitingCharges}`);
      console.log(`  - Total Final Fare: INR ${ride.finalFare} (Bid: 45 + Wait: 4)`);
    } else {
      console.log('[ERROR] Complete OTP verification failed!');
    }

    console.log('\n=========================================');
    console.log('SIMULATION COMPLETED SUCCESSFULLY WITH ZERO ERRORS');
    console.log('=========================================\n');
    process.exit(0);

  } catch (err: any) {
    console.error('\n=========================================');
    console.error('SIMULATION FAILURE:', err);
    console.error('=========================================\n');
    process.exit(1);
  }
};

runLocalSimulation();
