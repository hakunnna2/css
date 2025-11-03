import { NextResponse } from 'next/server';
import { find, insertOne } from '@/lib/db';

export async function GET() {
  try {
    const members = await find('members');
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await insertOne('members', data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}