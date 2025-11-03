import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../lib/auth';
import sql from '../../../lib/db';
import { Event } from '../../../types';

export async function POST(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Event name is required' }, { status: 400 });
    }

    const date = new Date().toISOString();
    
    const result = await sql`
      INSERT INTO events (name, date) 
      VALUES (${name}, ${date}) 
      RETURNING *
    `;
    
    const newEvent = { ...result.rows[0], participants: [] } as Event;

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}
