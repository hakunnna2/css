import { NextResponse } from 'next/server';
import sql from '../../../lib/db';
import { Member, Event } from '../../../types';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function GET() {
  try {
    // Fetch members
    const membersResult = await sql<Member>`
      SELECT id, name, cni, cne, school_level as "schoolLevel", whatsapp 
      FROM members 
      ORDER BY name ASC
    `;
    
    // Fetch events and their participants
    const eventsResult = await sql`
      SELECT
        e.id,
        e.name,
        e.date,
        COALESCE(
          json_agg(
            json_build_object(
              'memberId', p.member_id,
              'status', p.status,
              'points', p.points
            )
          ) FILTER (WHERE p.member_id IS NOT NULL),
          '[]'::json
        ) as participants
      FROM events e
      LEFT JOIN participants p ON e.id = p.event_id
      GROUP BY e.id
      ORDER BY e.date DESC;
    `;

    return NextResponse.json({
      members: membersResult.rows,
      events: eventsResult.rows as Event[],
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch data." }, { status: 500 });
  }
}
