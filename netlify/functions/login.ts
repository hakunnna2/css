import type { Handler, HandlerEvent } from "@netlify/functions";
import { checkAdminCredentials, generateToken } from "./utils/auth";

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const { cni, password } = JSON.parse(event.body || '{}');

    if (!cni || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: 'CNI and password are required' }) };
    }

    const isValid = checkAdminCredentials(cni, password);

    if (isValid) {
      const token = generateToken(cni, password);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Login successful', token }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
