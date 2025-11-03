import type { HandlerContext } from "@netlify/functions";

const ADMIN_CREDENTIALS = [
  { cni: 'admin', password: 'password' },
  { cni: 'GI11120', password: 'CSS12340' },
  { cni: 'K591388', password: '0661690222Ma' },
];

export function checkAdminCredentials(cni: string, pass: string): boolean {
    return ADMIN_CREDENTIALS.some(cred => cred.cni === cni && cred.password === pass);
}

export function generateToken(cni: string, pass: string): string {
    // FIX: Replaced Buffer with btoa for Base64 encoding to resolve "Cannot find name 'Buffer'" error.
    return btoa(`${cni}:${pass}`);
}

// Middleware-style function to verify the token for protected routes
export function verifyAdmin(context: HandlerContext): boolean {
    const authHeader = context.clientContext?.identity?.token || context.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    try {
        // FIX: Replaced Buffer with atob for Base64 decoding to resolve "Cannot find name 'Buffer'" error.
        const decoded = atob(token);
        const [cni, password] = decoded.split(':');
        return checkAdminCredentials(cni, password);
    } catch (e) {
        return false;
    }
}