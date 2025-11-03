import type { Handler } from "@netlify/functions";
import pool from './utils/db';

export const handler: Handler = async () => {
  const client = await pool.connect();
  try {
    const membersRes = await client.query('SELECT * FROM members ORDER BY name ASC');
    
    // This query efficiently fetches events and aggregates their participants into a JSON array
    const eventsQuery = `
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
    const eventsRes = await client.query(eventsQuery);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        members: membersRes.rows,
        events: eventsRes.rows,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch data." }),
    };
  } finally {
    client.release();
  }
};
