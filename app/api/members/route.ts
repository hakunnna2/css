import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../lib/auth';
import sql from '../../../lib/db';
import { Member } from '../../../types';

// Helper to map DB columns to camelCase
const mapMemberToCamelCase = (dbMember: any): Member => ({
  id: dbMember.id,
  name: dbMember.name,
  cni: dbMember.cni,
  cne: dbMember.cne,
  schoolLevel: dbMember.school_level,
  whatsapp: dbMember.whatsapp
});

export async function POST(request: Request) {
    if (!verifyAdmin(request)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Handle bulk import
        if (body.members && Array.isArray(body.members)) {
            const membersToImport: Omit<Member, 'id'>[] = body.members;
            if (membersToImport.length === 0) {
                return NextResponse.json([], { status: 200 });
            }

            // Vercel Postgres SDK doesn't support UNNEST directly, so we use a transaction
            const importedMembers: Member[] = [];
            for (const member of membersToImport) {
                const result = await sql`
                    INSERT INTO members (name, cni, cne, school_level, whatsapp)
                    VALUES (${member.name}, ${member.cni}, ${member.cne}, ${member.schoolLevel}, ${member.whatsapp})
                    ON CONFLICT (cni) DO NOTHING
                    RETURNING *
                `;
                if(result.rows.length > 0) {
                   importedMembers.push(mapMemberToCamelCase(result.rows[0]));
                }
            }
            
            return NextResponse.json(importedMembers, { status: 201 });
        }

        // Handle single member creation
        if (body.memberData) {
            const { name, cni, cne, schoolLevel, whatsapp } = body.memberData as Omit<Member, 'id'>;
            if (!name || !cni) {
                return NextResponse.json({ message: 'Name and CNI are required' }, { status: 400 });
            }
            const result = await sql`
                INSERT INTO members (name, cni, cne, school_level, whatsapp)
                VALUES (${name}, ${cni}, ${cne}, ${schoolLevel}, ${whatsapp})
                RETURNING *
            `;
            return NextResponse.json(mapMemberToCamelCase(result.rows[0]), { status: 201 });
        }

        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });

    } catch (error: any) {
        console.error(error);
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ message: 'A member with this CNI already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error processing members' }, { status: 500 });
    }
}
