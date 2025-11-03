import type { Handler, HandlerEvent } from "@netlify/functions";
import { verifyAdmin } from './utils/auth';
import pool from './utils/db';

export const handler: Handler = async (event: HandlerEvent, context) => {
    if (!verifyAdmin(context)) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    const client = await pool.connect();
    try {
        const body = JSON.parse(event.body || '{}');
        const { eventId, memberId } = body;

        if (!eventId || !memberId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'eventId and memberId are required' }) };
        }

        switch (event.httpMethod) {
            case 'POST': { // Add participant
                const query = 'INSERT INTO participants (event_id, member_id) VALUES ($1, $2) RETURNING *';
                const result = await client.query(query, [eventId, memberId]);
                return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
            }
            case 'DELETE': { // Remove participant
                const query = 'DELETE FROM participants WHERE event_id = $1 AND member_id = $2';
                await client.query(query, [eventId, memberId]);
                return { statusCode: 204, body: '' }; // No Content
            }
            case 'PUT': { // Update status/points
                const { status, points } = body;
                const updates: string[] = [];
                const values: (string | number)[] = [];
                let queryIndex = 1;

                if (status) {
                    updates.push(`status = $${queryIndex++}`);
                    values.push(status);
                }
                if (points !== undefined) {
                    updates.push(`points = $${queryIndex++}`);
                    values.push(points);
                }

                if (updates.length === 0) {
                    return { statusCode: 400, body: JSON.stringify({ message: 'No fields to update' }) };
                }

                values.push(eventId, memberId);
                const query = `
                    UPDATE participants SET ${updates.join(', ')}
                    WHERE event_id = $${queryIndex++} AND member_id = $${queryIndex++}
                    RETURNING *
                `;

                const result = await client.query(query, values);
                return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
            }
            default:
                return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
        }
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error managing participant' }) };
    } finally {
        client.release();
    }
};
