import { Schema, model, Document } from 'mongoose';

export interface ISavedPlace {
  label: string; // e.g., 'Home', 'Work'
  address: string;
  latitude: number;
  longitude: number;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IUser extends Document {
  phone: string;
  role: 'passenger' | 'driver' | 'admin';
  name?: string;
  email?: string;
  profilePicture?: string;
  language: 'en' | 'hi' | 'or' | 'ben';
  savedPlaces: ISavedPlace[];
  emergencyContacts: IEmergencyContact[];
  favoriteDrivers: Schema.Types.ObjectId[];
  blockedDrivers: Schema.Types.ObjectId[];
  rating: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedPlaceSchema = new Schema<ISavedPlace>({
  label: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

const EmergencyContactSchema = new Schema<IEmergencyContact>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true }
});

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['passenger', 'driver', 'admin'], required: true },
    name: { type: String },
    email: { type: String },
    profilePicture: { type: String, default: '' },
    language: { type: String, enum: ['en', 'hi', 'or', 'ben'], default: 'en' },
    savedPlaces: { type: [SavedPlaceSchema], default: [] },
    emergencyContacts: { type: [EmergencyContactSchema], default: [] },
    favoriteDrivers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    blockedDrivers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    rating: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
