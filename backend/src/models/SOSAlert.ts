import { Schema, model, Document } from 'mongoose';

export interface ISOSAlert extends Document {
  rideId: Schema.Types.ObjectId; // References Ride
  userId: Schema.Types.ObjectId; // References User who triggered it
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  status: 'active' | 'resolved';
  resolvedBy?: Schema.Types.ObjectId; // References Admin User
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SOSAlertSchema = new Schema<ISOSAlert>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

SOSAlertSchema.index({ location: '2dsphere' });

export const SOSAlert = model<ISOSAlert>('SOSAlert', SOSAlertSchema);
