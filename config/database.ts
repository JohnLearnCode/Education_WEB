import { MongoClient, Db, Collection, Document } from 'mongodb';

/**
 * MongoDB Connection - TypeScript Version
 */

let db: Db | null = null;
let client: MongoClient | null = null;

/**
 * Kết nối MongoDB
 */
export const connectDB = async (): Promise<Db> => {
  try {
    const DB_URL = process.env.MONGODB_URL;
    const DB_NAME = process.env.DB_NAME;

    if (!DB_URL) {
      throw new Error('MONGODB_URL is not defined in .env file');
    }
    client = new MongoClient(DB_URL);
    await client.connect();
    db = client.db(DB_NAME);

    console.log('✅ MongoDB connected successfully!');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Đóng kết nối MongoDB
 */
export const closeDB = async (): Promise<void> => {
  try {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed successfully!');
      db = null;
      client = null;
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Lấy collection với type safety
 */
export const getCollection = <T extends Document>(name: string): Collection<T> => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db.collection<T>(name);
};
