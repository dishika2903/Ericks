import { Schema, model, Document } from 'mongoose';

export interface IDeliveryBid {
  driverId: Schema.Types.ObjectId;
  fareOffer: number;
  etaMinutes: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface IDelivery extends Document {
  senderId: Schema.Types.ObjectId; // References User
  driverId?: Schema.Types.ObjectId; // References Driver
  status: 'requested' | 'bidding' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  packageType: 'grocery' | 'medicine' | 'documents' | 'parcel' | 'other';
  isFragile: boolean;
  pickupAddress: string;
  pickupCoords: number[]; // [longitude, latitude]
  recipientName: string;
  recipientPhone: string;
  dropoffAddress: string;
  dropoffCoords: number[]; // [longitude, latitude]
  otp: string; // Verification OTP at delivery point
  suggestedFare: number;
  finalFare?: number;
  bids: IDeliveryBid[];
  payment: {
    method: 'cash' | 'upi';
    status: 'pending' | 'completed';
    transactionId?: string;
  };
  timestamps: {
    requestedAt: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };
}

const DeliveryBidSchema = new Schema<IDeliveryBid>({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  fareOffer: { type: Number, required: true },
  etaMinutes: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' }
}, { _id: false });

const DeliverySchema = new Schema<IDelivery>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
    status: {
      type: String,
      enum: ['requested', 'bidding', 'accepted', 'picked_up', 'delivered', 'cancelled'],
      default: 'requested'
    },
    packageType: {
      type: String,
      enum: ['grocery', 'medicine', 'documents', 'parcel', 'other'],
      required: true
    },
    isFragile: { type: Boolean, default: false },
    pickupAddress: { type: String, required: true },
    pickupCoords: { type: [Number], required: true }, // [longitude, latitude]
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    dropoffAddress: { type: String, required: true },
    dropoffCoords: { type: [Number], required: true }, // [longitude, latitude]
    otp: { type: String, required: true },
    suggestedFare: { type: Number, required: true },
    finalFare: { type: Number },
    bids: { type: [DeliveryBidSchema], default: [] },
    payment: {
      method: { type: String, enum: ['cash', 'upi'], default: 'cash' },
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      transactionId: { type: String }
    },
    timestamps: {
      requestedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      pickedUpAt: { type: Date },
      deliveredAt: { type: Date },
      cancelledAt: { type: Date }
    }
  },
  { timestamps: true }
);

DeliverySchema.index({ pickupCoords: '2dsphere' });
DeliverySchema.index({ dropoffCoords: '2dsphere' });

export const Delivery = model<IDelivery>('Delivery', DeliverySchema);
