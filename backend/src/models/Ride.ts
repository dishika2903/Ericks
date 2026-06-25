import { Schema, model, Document } from 'mongoose';

export interface ILocationPoint {
  address: string;
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
}

export interface IRideBid {
  driverId: Schema.Types.ObjectId; // References Driver
  fareOffer: number;
  etaMinutes: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface IRide extends Document {
  passengerId: Schema.Types.ObjectId; // References User (role='passenger')
  driverId?: Schema.Types.ObjectId; // References Driver
  status: 'requested' | 'bidding' | 'accepted' | 'arrived' | 'started' | 'completed' | 'cancelled';
  poolingAllowed: boolean;
  passengerCount: number;
  pickup: ILocationPoint;
  destination: ILocationPoint;
  suggestedFare: number;
  finalFare?: number;
  otp: {
    startRide: string;
    completeRide: string;
  };
  bids: IRideBid[];
  timestamps: {
    requestedAt: Date;
    acceptedAt?: Date;
    arrivedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };
  cancellation?: {
    cancelledBy: 'passenger' | 'driver' | 'system';
    reason?: string;
    feeApplied: number;
  };
  waitingTimeSeconds: number;
  waitingChargesApplied: number;
  payment: {
    method: 'cash' | 'upi';
    status: 'pending' | 'completed';
    transactionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LocationPointSchema = new Schema<ILocationPoint>({
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { _id: false });

const RideBidSchema = new Schema<IRideBid>({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  fareOffer: { type: Number, required: true },
  etaMinutes: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' }
}, { _id: false });

const RideSchema = new Schema<IRide>(
  {
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
    status: {
      type: String,
      enum: ['requested', 'bidding', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
      default: 'requested'
    },
    poolingAllowed: { type: Boolean, default: false },
    passengerCount: { type: Number, default: 1 },
    pickup: { type: LocationPointSchema, required: true },
    destination: { type: LocationPointSchema, required: true },
    suggestedFare: { type: Number, required: true },
    finalFare: { type: Number },
    otp: {
      startRide: { type: String, required: true },
      completeRide: { type: String, required: true }
    },
    bids: { type: [RideBidSchema], default: [] },
    timestamps: {
      requestedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      arrivedAt: { type: Date },
      startedAt: { type: Date },
      completedAt: { type: Date },
      cancelledAt: { type: Date }
    },
    cancellation: {
      cancelledBy: { type: String, enum: ['passenger', 'driver', 'system'] },
      reason: { type: String },
      feeApplied: { type: Number, default: 0 }
    },
    waitingTimeSeconds: { type: Number, default: 0 },
    waitingChargesApplied: { type: Number, default: 0 },
    payment: {
      method: { type: String, enum: ['cash', 'upi'], default: 'cash' },
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      transactionId: { type: String }
    }
  },
  { timestamps: true }
);

RideSchema.index({ 'pickup.location': '2dsphere' });
RideSchema.index({ 'destination.location': '2dsphere' });

export const Ride = model<IRide>('Ride', RideSchema);
