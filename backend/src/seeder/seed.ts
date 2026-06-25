import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { Delivery } from '../models/Delivery';
import { Complaint } from '../models/Complaint';
import { SOSAlert } from '../models/SOSAlert';

// Load environment variables
dotenv.config();

// Base location coordinates (Saket Nagar, Indore, India)
const BASE_LAT = 22.7196;
const BASE_LNG = 75.8577;

// Helper: generate coordinates within offset
const getRandomCoords = (offset = 0.03) => {
  const lat = BASE_LAT + (Math.random() - 0.5) * offset;
  const lng = BASE_LNG + (Math.random() - 0.5) * offset;
  return { lat, lng };
};

const indianPassengerNames = [
  'Arjun Patel', 'Deepika Rao', 'Amit Mishra', 'Priya Sharma', 'Vijay Singh',
  'Sunita Gupta', 'Karan Johar', 'Neha Dhupia', 'Rajesh Sharma', 'Vikram Seth',
  'Sneha Reddy', 'Rahul Verma', 'Anjali Desai', 'Sanjay Dutt', 'Meera Nair',
  'Aditya Roy', 'Divya Dutta', 'Abhishek Verma', 'Kavita Iyer', 'Siddharth Das'
];

const indianDriverNames = [
  'Satnam Singh', 'Harpreet Singh', 'Gurpreet Singh', 'Ramesh Kumar', 'Suresh Prasad',
  'Maninder Singh', 'Baldev Raj', 'Rajinder Singh', 'Jaswant Singh', 'Jagjit Singh',
  'Kuldeep Yadav', 'Dinesh Karthik', 'Vijay Shankar', 'Anil Kumble', 'Javagal Srinath',
  'Harbhajan Singh', 'Yuvraj Singh', 'Zaheer Khan', 'Ashish Nehra', 'Sandeep Sharma',
  'Bhuvaneshwar Kumar', 'Umesh Yadav', 'Mohammed Shami', 'Jasprit Bumrah', 'Hardik Pandya',
  'Krunal Pandya', 'Axar Patel', 'Ravindra Jadeja', 'Ravichandran Ashwin', 'Ishant Sharma'
];

const vehicleModels = ['Mahindra Treo', 'Piaggio Ape E-City', 'Kinetic Green Safar', 'Euler Hiload', 'Lohia Comfort'];
const packageTypes: ('grocery' | 'medicine' | 'documents' | 'parcel' | 'other')[] = ['grocery', 'medicine', 'documents', 'parcel', 'other'];
const complaintCategories: ('behavior' | 'overcharging' | 'safety' | 'lost_item' | 'other')[] = ['behavior', 'overcharging', 'safety', 'lost_item', 'other'];

const seedData = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ericks';
  console.log(`[Seeder] Connecting to database: ${connUri}`);
  
  await mongoose.connect(connUri);
  console.log('[Seeder] Database connected successfully.');

  const isReset = process.argv.includes('--reset');

  if (isReset) {
    console.log('[Seeder] Reset flag detected. Purging existing database collections...');
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    await Delivery.deleteMany({});
    await Complaint.deleteMany({});
    await SOSAlert.deleteMany({});
    console.log('[Seeder] Collections purged successfully.');
  }

  // 1. Check/Insert Admin Account
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = new User({
      phone: '+919999911111',
      role: 'admin',
      name: 'E-Ricks Admin',
      email: 'admin@ericks.com',
      language: 'en'
    });
    await adminUser.save();
    console.log(`[Seeder] Default Admin user created: ${adminUser.phone}`);
  }

  // 2. Seed 20 Passengers
  const passengerDocs: any[] = [];
  for (let i = 0; i < 20; i++) {
    const phone = `+9198000001${String(i).padStart(2, '0')}`;
    let passenger = await User.findOne({ phone });
    if (!passenger) {
      const name = indianPassengerNames[i];
      const coords = getRandomCoords(0.02);
      passenger = new User({
        phone,
        role: 'passenger',
        name,
        email: `${name.toLowerCase().replace(/ /g, '.')}@example.com`,
        language: Math.random() > 0.5 ? 'en' : 'hi',
        savedPlaces: [
          {
            label: 'Home',
            address: `${Math.floor(Math.random() * 200) + 1}, Saket Sector ${Math.floor(Math.random() * 5) + 1}, Indore`,
            latitude: coords.lat,
            longitude: coords.lng
          }
        ],
        emergencyContacts: [
          {
            name: `${name.split(' ')[0]}'s Family`,
            phone: `+9191000000${String(i).padStart(2, '0')}`,
            relationship: 'Relative'
          }
        ],
        rating: +(4.0 + Math.random() * 1.0).toFixed(1),
        ratingCount: Math.floor(Math.random() * 20) + 1
      });
      await passenger.save();
    }
    passengerDocs.push(passenger);
  }
  console.log(`[Seeder] Seeded ${passengerDocs.length} passengers.`);

  // 3. Seed 30 Drivers (Verified)
  const driverDocs: any[] = [];
  for (let i = 0; i < 30; i++) {
    const phone = `+9197000001${String(i).padStart(2, '0')}`;
    let driverUser = await User.findOne({ phone });
    if (!driverUser) {
      const name = indianDriverNames[i];
      driverUser = new User({
        phone,
        role: 'driver',
        name,
        email: `${name.toLowerCase().replace(/ /g, '.')}@example.com`,
        language: Math.random() > 0.4 ? 'hi' : 'en',
        rating: +(4.2 + Math.random() * 0.8).toFixed(1),
        ratingCount: Math.floor(Math.random() * 50) + 5
      });
      await driverUser.save();
    }

    let driver = await Driver.findOne({ userId: driverUser._id });
    if (!driver) {
      const coords = getRandomCoords(0.04);
      driver = new Driver({
        userId: driverUser._id,
        status: i % 5 === 0 ? 'break' : i % 7 === 0 ? 'offline' : 'online',
        verificationStatus: 'verified',
        documents: {
          aadhaarNumber: `33445566${String(i).padStart(4, '0')}`,
          aadhaarUrl: `http://docs.ericks.com/aadhaar_driver_${i}.jpg`,
          licenseNumber: `DL-MP09-2026-${String(i).padStart(4, '0')}`,
          licenseUrl: `http://docs.ericks.com/dl_driver_${i}.jpg`,
          vehicleRcNumber: `RC-MP09-ER-${String(1000 + i)}`,
          vehicleRcUrl: `http://docs.ericks.com/rc_driver_${i}.jpg`,
          vehiclePhotoUrl: `http://docs.ericks.com/vehicle_driver_${i}.jpg`,
          selfieUrl: `http://docs.ericks.com/selfie_driver_${i}.jpg`
        },
        vehicle: {
          make: 'Mahindra',
          model: vehicleModels[i % vehicleModels.length],
          plateNumber: `MP09ER${1000 + i}`,
          capacity: i % 4 === 0 ? 6 : 4,
          batteryLevel: Math.floor(Math.random() * 60) + 40, // 40% to 100%
          isClosedBody: i % 3 === 0
        },
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat] // [longitude, latitude]
        },
        penalties: {
          dailyCancellations: Math.floor(Math.random() * 2),
          weeklyCancellations: Math.floor(Math.random() * 5),
          ridePriorityScore: 100 - (Math.floor(Math.random() * 3) * 5)
        }
      });
      await driver.save();
    }
    driverDocs.push(driver);
  }
  console.log(`[Seeder] Seeded ${driverDocs.length} drivers.`);

  // 4. Seed 10 Completed Rides
  const completedRides: any[] = [];
  for (let i = 0; i < 10; i++) {
    const passenger = passengerDocs[i % passengerDocs.length];
    const driver = driverDocs[i % driverDocs.length];
    const pickupCoords = getRandomCoords(0.015);
    const dropCoords = getRandomCoords(0.015);
    
    // Calculate simulated coordinates distance approx
    const suggestedFare = 40 + Math.floor(Math.random() * 60); // 40 to 100 INR
    const finalFare = suggestedFare;

    const ride = new Ride({
      passengerId: passenger._id,
      driverId: driver._id,
      status: 'completed',
      poolingAllowed: i % 3 === 0,
      passengerCount: 1 + (i % 3),
      pickup: {
        address: `${Math.floor(Math.random() * 50) + 1}, Palasia square, Indore`,
        location: { type: 'Point', coordinates: [pickupCoords.lng, pickupCoords.lat] }
      },
      destination: {
        address: `${Math.floor(Math.random() * 100) + 10}, Vijay Nagar, Indore`,
        location: { type: 'Point', coordinates: [dropCoords.lng, dropCoords.lat] }
      },
      suggestedFare,
      finalFare,
      otp: {
        startRide: String(Math.floor(1000 + Math.random() * 9000)),
        completeRide: String(Math.floor(1000 + Math.random() * 9000))
      },
      timestamps: {
        requestedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // days ago
        acceptedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 1 * 60000),
        arrivedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 4 * 60000),
        startedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 6 * 60000),
        completedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 20 * 60000)
      },
      waitingTimeSeconds: Math.floor(Math.random() * 300), // < 5 mins
      waitingChargesApplied: 0,
      payment: {
        method: i % 2 === 0 ? 'upi' : 'cash',
        status: 'completed',
        transactionId: i % 2 === 0 ? `txn_${Math.floor(Math.random() * 1000000)}` : undefined
      }
    });

    await ride.save();
    completedRides.push(ride);
  }
  console.log(`[Seeder] Seeded ${completedRides.length} completed rides.`);

  // 5. Seed 5 Ongoing Rides (Active)
  const ongoingRides: any[] = [];
  const activeRideStatuses: ('accepted' | 'arrived' | 'started')[] = ['accepted', 'arrived', 'started'];
  for (let i = 0; i < 5; i++) {
    const passenger = passengerDocs[(i + 10) % passengerDocs.length];
    const driver = driverDocs[(i + 10) % driverDocs.length];
    const pickupCoords = getRandomCoords(0.01);
    const dropCoords = getRandomCoords(0.01);
    const suggestedFare = 35 + Math.floor(Math.random() * 40);

    const rideStatus = activeRideStatuses[i % activeRideStatuses.length];

    const ride = new Ride({
      passengerId: passenger._id,
      driverId: driver._id,
      status: rideStatus,
      poolingAllowed: false,
      passengerCount: 1,
      pickup: {
        address: `Gate ${i + 1}, Rajwada Market, Indore`,
        location: { type: 'Point', coordinates: [pickupCoords.lng, pickupCoords.lat] }
      },
      destination: {
        address: `Sector B-${i}, Scheme 78, Indore`,
        location: { type: 'Point', coordinates: [dropCoords.lng, dropCoords.lat] }
      },
      suggestedFare,
      finalFare: suggestedFare + 5,
      otp: {
        startRide: '4321',
        completeRide: '8765'
      },
      timestamps: {
        requestedAt: new Date(Date.now() - 10 * 60000), // 10 mins ago
        acceptedAt: new Date(Date.now() - 9 * 60000),
        arrivedAt: rideStatus !== 'accepted' ? new Date(Date.now() - 5 * 60000) : undefined,
        startedAt: rideStatus === 'started' ? new Date(Date.now() - 2 * 60000) : undefined
      },
      waitingTimeSeconds: rideStatus === 'started' ? 120 : 0,
      waitingChargesApplied: 0,
      payment: {
        method: 'upi',
        status: 'pending'
      }
    });

    await ride.save();
    ongoingRides.push(ride);
  }
  console.log(`[Seeder] Seeded ${ongoingRides.length} active/ongoing rides.`);

  // 6. Seed 8 Deliveries
  const deliveries: any[] = [];
  for (let i = 0; i < 8; i++) {
    const sender = passengerDocs[(i + 5) % passengerDocs.length];
    const driver = driverDocs[(i + 15) % driverDocs.length];
    const pCoords = getRandomCoords(0.02);
    const dCoords = getRandomCoords(0.02);
    const suggestedFare = 45 + Math.floor(Math.random() * 30);

    const delivery = new Delivery({
      senderId: sender._id,
      driverId: driver._id,
      status: i < 5 ? 'delivered' : i === 5 ? 'picked_up' : 'accepted',
      packageType: packageTypes[i % packageTypes.length],
      isFragile: i % 2 === 0,
      pickupAddress: `Store ${i + 10}, Chhappan Dukan, Indore`,
      pickupCoords: [pCoords.lng, pCoords.lat],
      recipientName: `Recipient ${i + 1}`,
      recipientPhone: `+9196000009${String(i).padStart(2, '0')}`,
      dropoffAddress: `Appt ${i * 4 + 12}, Geeta Bhawan Square, Indore`,
      dropoffCoords: [dCoords.lng, dCoords.lat],
      otp: `660${i}`,
      suggestedFare,
      finalFare: suggestedFare,
      payment: {
        method: i % 2 === 0 ? 'cash' : 'upi',
        status: i < 5 ? 'completed' : 'pending'
      },
      timestamps: {
        requestedAt: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000 + 2 * 60000),
        pickedUpAt: i < 5 || i === 5 ? new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000 + 10 * 60000) : undefined,
        deliveredAt: i < 5 ? new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000 + 25 * 60000) : undefined
      }
    });

    await delivery.save();
    deliveries.push(delivery);
  }
  console.log(`[Seeder] Seeded ${deliveries.length} deliveries.`);

  // 7. Seed 5 Complaints
  const complaints: any[] = [];
  for (let i = 0; i < 5; i++) {
    const passenger = passengerDocs[i % passengerDocs.length];
    const driver = driverDocs[i % driverDocs.length];
    const ride = completedRides[i % completedRides.length];

    const complaint = new Complaint({
      reporterId: passenger._id,
      reportedUserId: driver.userId,
      rideId: ride._id,
      category: complaintCategories[i % complaintCategories.length],
      description: `Simulated complaint feedback concerning category: ${complaintCategories[i % complaintCategories.length]}. Please inspect this transaction log.`,
      status: i % 2 === 0 ? 'open' : 'resolved',
      resolutionDetails: i % 2 !== 0 ? 'Resolved by warning the user and updating operational logs.' : undefined,
      resolvedAt: i % 2 !== 0 ? new Date() : undefined
    });

    await complaint.save();
    complaints.push(complaint);
  }
  console.log(`[Seeder] Seeded ${complaints.length} complaints.`);

  // 8. Seed 3 SOS Alerts
  const sosAlerts: any[] = [];
  for (let i = 0; i < 3; i++) {
    const ride = ongoingRides[i % ongoingRides.length];
    const coords = getRandomCoords(0.005);

    const sos = new SOSAlert({
      rideId: ride._id,
      userId: ride.passengerId,
      location: {
        type: 'Point',
        coordinates: [coords.lng, coords.lat]
      },
      status: i === 0 ? 'active' : 'resolved',
      resolutionNotes: i !== 0 ? 'Resolved: False alarm triggered by child playing. Contacted passenger directly.' : undefined,
      resolvedBy: i !== 0 ? adminUser._id : undefined,
      resolvedAt: i !== 0 ? new Date() : undefined
    });

    await sos.save();
    sosAlerts.push(sos);
  }
  console.log(`[Seeder] Seeded ${sosAlerts.length} SOS alerts.`);

  console.log('\n=========================================');
  console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY');
  console.log('=========================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch(err => {
  console.error('[Seeder] Error during seeding:', err);
  process.exit(1);
});
