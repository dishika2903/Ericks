import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ericks';
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(connUri);
    console.log(`[Database] MongoDB Connected to: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};
