import { MongoClient } from 'mongodb';

const uri = import.meta.env.VITE_MONGO_URL;
console.log('Testing MongoDB connection...');

async function testConnection() {
  if (!uri) {
    console.error('MongoDB URI is not defined in environment variables!');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    const db = client.db('club-points');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  } finally {
    await client.close();
  }
}

testConnection();