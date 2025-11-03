import type { Handler, HandlerEvent } from "@netlify/functions";
import { verifyAdmin } from './utils/auth';
import pool from './utils/db';
import { Member } from '../../types';

export const handler: Handler = async (event: HandlerEvent, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    if (!verifyAdmin(context)) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    const client = await pool.connect();
    try {
        const body = JSON.parse(event.body || '{}');

        // Handle bulk import
        if (body.members && Array.isArray(body.members)) {
            const membersToImport = body.members;
            if (membersToImport.length === 0) {
                return { statusCode: 200, body: JSON.stringify([]) };
            }
            
            const query = `
                INSERT INTO members (name, cni, cne, school_level, whatsapp)
                SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[])
                RETURNING *
            `;
            
            const values = [
                membersToImport.map(m => m.name),
                membersToImport.map(m => m.cni),
                membersToImport.map(m => m.cne),
                membersToImport.map(m => m.schoolLevel),
                membersToImport.map(m => m.whatsapp),
            ];
            
            const result = await client.query(query, values);
            return { statusCode: 201, body: JSON.stringify(result.rows) };
        }

        // Handle single member creation
        if (body.memberData) {
            const { name, cni, cne, schoolLevel, whatsapp } = body.memberData as Omit<Member, 'id'>;
            if (!name || !cni) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Name and CNI are required' }) };
            }
            const query = `
                INSERT INTO members (name, cni, cne, school_level, whatsapp)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const result = await client.query(query, [name, cni, cne, schoolLevel, whatsapp]);
            return { statusCode: 201, body: JSON.stringify(result.rows[0]) };
        }

        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid request body' }) };

    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique constraint violation
            return { statusCode: 409, body: JSON.stringify({ message: 'A member with this CNI already exists.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Error processing members' }) };
    } finally {
        client.release();
    }
};
