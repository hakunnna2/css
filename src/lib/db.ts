import { MongoClient } from 'mongodb';

const uri = import.meta.env.VITE_MONGO_URL || process.env.MONGO_URL;
if (!uri) {
  throw new Error('Please define the MONGO_URL environment variable');
}

const options = {};
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Create a new MongoClient
client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;

// Database helper functions
export async function getDb() {
  const client = await clientPromise;
  return client.db('club-points'); // You can change the database name
}

export async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

// CRUD operations
export async function findOne(collectionName: string, query: any) {
  const collection = await getCollection(collectionName);
  return collection.findOne(query);
}

export async function find(collectionName: string, query: any = {}) {
  const collection = await getCollection(collectionName);
  return collection.find(query).toArray();
}

export async function insertOne(collectionName: string, document: any) {
  const collection = await getCollection(collectionName);
  return collection.insertOne(document);
}

export async function updateOne(collectionName: string, query: any, update: any) {
  const collection = await getCollection(collectionName);
  return collection.updateOne(query, { $set: update });
}

export async function deleteOne(collectionName: string, query: any) {
  const collection = await getCollection(collectionName);
  return collection.deleteOne(query);
}