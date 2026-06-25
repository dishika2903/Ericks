import { Schema, model, Document } from 'mongoose';

export interface IDriverDocs {
  aadhaarNumber?: string;
  aadhaarUrl?: string;
  licenseNumber?: string;
  licenseUrl?: string;
  vehicleRcNumber?: string;
  vehicleRcUrl?: string;
  vehiclePhotoUrl?: string;
  selfieUrl?: string;
}

export interface IVehicleInfo {
  make: string;
  model: string;
  plateNumber: string;
  capacity: number; // e.g., 4 or 6
  batteryLevel: number; // 0 to 100
  isClosedBody: boolean; // Weather-protected
}

export interface IDriverPenalties {
  dailyCancellations: number;
  weeklyCancellations: number;
  lastCancellationDate?: Date;
  ridePriorityScore: number; // Out of 100
}

export interface IDriver extends Document {
  userId: Schema.Types.ObjectId; // References User (role='driver')
  status: 'offline' | 'online' | 'break';
  verificationStatus: 'pending_registration' | 'pending_verification' | 'verified' | 'rejected';
  rejectionReason?: string;
  documents: IDriverDocs;
  vehicle?: IVehicleInfo;
  location?: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  operatingZone?: {
    type: 'Polygon';
    coordinates: number[][][]; // Array of arrays of [lng, lat]
  };
  penalties: IDriverPenalties;
  createdAt: Date;
  updatedAt: Date;
}

const DriverDocsSchema = new Schema<IDriverDocs>({
  aadhaarNumber: { type: String },
  aadhaarUrl: { type: String, default: '' },
  licenseNumber: { type: String },
  licenseUrl: { type: String, default: '' },
  vehicleRcNumber: { type: String },
  vehicleRcUrl: { type: String, default: '' },
  vehiclePhotoUrl: { type: String, default: '' },
  selfieUrl: { type: String, default: '' }
}, { _id: false });

const VehicleInfoSchema = new Schema<IVehicleInfo>({
  make: { type: String, required: true },
  model: { type: String, required: true },
  plateNumber: { type: String, required: true },
  capacity: { type: Number, required: true, default: 4 },
  batteryLevel: { type: Number, required: true, default: 100, min: 0, max: 100 },
  isClosedBody: { type: Boolean, required: true, default: false }
}, { _id: false });

const DriverPenaltiesSchema = new Schema<IDriverPenalties>({
  dailyCancellations: { type: Number, default: 0 },
  weeklyCancellations: { type: Number, default: 0 },
  lastCancellationDate: { type: Date },
  ridePriorityScore: { type: Number, default: 100, min: 0, max: 100 }
}, { _id: false });

const DriverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['offline', 'online', 'break'], default: 'offline' },
    verificationStatus: {
      type: String,
      enum: ['pending_registration', 'pending_verification', 'verified', 'rejected'],
      default: 'pending_registration'
    },
    rejectionReason: { type: String, default: '' },
    documents: { type: DriverDocsSchema, default: {} },
    vehicle: { type: VehicleInfoSchema },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
    operatingZone: {
      type: { type: String, enum: ['Polygon'] },
      coordinates: { type: [[[Number]]] }
    },
    penalties: { type: DriverPenaltiesSchema, default: {} }
  },
  { timestamps: true }
);

// Enable geospatial queries on coordinates
DriverSchema.index({ location: '2dsphere' });

export const Driver = model<IDriver>('Driver', DriverSchema);
