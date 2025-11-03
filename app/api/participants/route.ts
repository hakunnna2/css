import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../lib/auth';
import sql from '../../../lib/db';

async function handleRequest(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { eventId, memberId } = body;

        if (!eventId || !memberId) {
            return NextResponse.json({ message: 'eventId and memberId are required' }, { status: 400 });
        }

        switch (request.method) {
            case 'POST': {
                const result = await sql`
                    INSERT INTO participants (event_id, member_id) 
                    VALUES (${eventId}, ${memberId}) 
                    ON CONFLICT DO NOTHING RETURNING *
                `;
                return NextResponse.json(result.rows[0], { status: 201 });
            }
            case 'DELETE': {
                await sql`
                    DELETE FROM participants 
                    WHERE event_id = ${eventId} AND member_id = ${memberId}
                `;
                return new NextResponse(null, { status: 204 }); // No Content
            }
            case 'PUT': {
                const { status, points } = body;
                
                if (status === undefined && points === undefined) {
                    return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
                }

                // Build the SET clause dynamically
                const updates = [];
                if (status) updates.push(sql`status = ${status}`);
                if (points !== undefined) updates.push(sql`points = ${points}`);

                const finalQuery = sql`
                    UPDATE participants SET ${sql.join(updates, ', ')}
                    WHERE event_id = ${eventId} AND member_id = ${memberId}
                    RETURNING *
                `;
                
                const result = await finalQuery;
                return NextResponse.json(result.rows[0]);
            }
            default:
                return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error managing participant' }, { status: 500 });
    }
}

export { handleRequest as POST, handleRequest as DELETE, handleRequest as PUT };
