import { NextResponse } from 'next/server';
import { checkAdminCredentials, generateToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { cni, password } = await request.json();

    if (!cni || !password) {
      return NextResponse.json({ message: 'CNI and password are required' }, { status: 400 });
    }

    const isValid = checkAdminCredentials(cni, password);

    if (isValid) {
      const token = generateToken(cni, password);
      return NextResponse.json({ message: 'Login successful', token });
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
