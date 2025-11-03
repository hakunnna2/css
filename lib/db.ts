import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

export async function getDb() {
  const client = await clientPromise;
  return client.db('club-points'); // You can change the database name if needed
}

// Utility functions for common database operations
export async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

// Example functions for CRUD operations
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

// Helper function to convert string to ObjectId
export function toObjectId(id: string) {
  return new ObjectId(id);
}