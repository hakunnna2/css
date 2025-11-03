import type { Handler, HandlerEvent } from "@netlify/functions";
import { verifyAdmin } from './utils/auth';
import pool from './utils/db';

export const handler: Handler = async (event: HandlerEvent, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  if (!verifyAdmin(context)) {
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }

  const client = await pool.connect();
  try {
    const { name } = JSON.parse(event.body || '{}');
    if (!name) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Event name is required' }) };
    }

    const query = 'INSERT INTO events (name, date) VALUES ($1, $2) RETURNING *';
    const values = [name, new Date()];
    const result = await client.query(query, values);
    
    // Add an empty participants array to match the frontend type
    const newEvent = { ...result.rows[0], participants: [] };

    return {
      statusCode: 201,
      body: JSON.stringify(newEvent),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error creating event' }) };
  } finally {
    client.release();
  }
};
