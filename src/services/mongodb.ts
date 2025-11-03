import { MongoClient } from 'mongodb';
import type { Member, Event } from '../../types';

const uri = import.meta.env.VITE_MONGO_URL || process.env.MONGO_URL;
if (!uri) {
  throw new Error('Please define the MONGO_URL environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Create a new MongoClient
client = new MongoClient(uri);
clientPromise = client.connect();

// Database helper functions
export async function getDb() {
  const client = await clientPromise;
  return client.db('club-points');
}

// Members Collection Operations
export async function getMembers() {
  const db = await getDb();
  return db.collection('members').find({}).toArray();
}

export async function addMember(member: Member) {
  const db = await getDb();
  return db.collection('members').insertOne(member);
}

export async function updateMember(id: string, member: Partial<Member>) {
  const db = await getDb();
  return db.collection('members').updateOne(
    { _id: id },
    { $set: member }
  );
}

export async function deleteMember(id: string) {
  const db = await getDb();
  return db.collection('members').deleteOne({ _id: id });
}

// Events Collection Operations
export async function getEvents() {
  const db = await getDb();
  return db.collection('events').find({}).toArray();
}

export async function addEvent(event: Event) {
  const db = await getDb();
  return db.collection('events').insertOne(event);
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const db = await getDb();
  return db.collection('events').updateOne(
    { _id: id },
    { $set: event }
  );
}

export async function deleteEvent(id: string) {
  const db = await getDb();
  return db.collection('events').deleteOne({ _id: id });
}

// Participants Collection Operations
export async function addParticipant(eventId: string, memberId: string) {
  const db = await getDb();
  return db.collection('participants').insertOne({
    eventId,
    memberId,
    timestamp: new Date()
  });
}

export async function getEventParticipants(eventId: string) {
  const db = await getDb();
  return db.collection('participants')
    .aggregate([
      { $match: { eventId } },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: '$member' }
    ]).toArray();
}

export async function getMemberEvents(memberId: string) {
  const db = await getDb();
  return db.collection('participants')
    .aggregate([
      { $match: { memberId } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' }
    ]).toArray();
}