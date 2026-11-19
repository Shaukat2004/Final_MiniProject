import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oncolink';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] Local MongoDB server not reachable (${error.message}).`);
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('MongoDB is required unless NODE_ENV=development. Refusing to start without persistent storage.');
    }
    console.log('[Database] Development-only in-memory fallback enabled. Do not use this mode for patient data.');
  }
};

export const getDBStatus = () => ({
  connected: isMongoConnected,
  type: isMongoConnected ? 'MongoDB Live' : 'Development In-Memory Fallback'
});

export const isMongoReady = () => isMongoConnected;
