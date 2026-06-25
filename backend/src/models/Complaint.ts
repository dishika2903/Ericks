import { Schema, model, Document } from 'mongoose';

export interface IComplaint extends Document {
  reporterId: Schema.Types.ObjectId; // References User
  reportedUserId?: Schema.Types.ObjectId; // References User (optional, e.g. for general feedback)
  rideId?: Schema.Types.ObjectId; // References Ride (optional)
  category: 'behavior' | 'overcharging' | 'safety' | 'lost_item' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionDetails?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', index: true },
    category: {
      type: String,
      enum: ['behavior', 'overcharging', 'safety', 'lost_item', 'other'],
      required: true
    },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
    resolutionDetails: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
