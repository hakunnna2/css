const ADMIN_CREDENTIALS = [
  { cni: 'admin', password: 'password' },
  { cni: 'GI11120', password: 'CSS12340' },
  { cni: 'K591388', password: '0661690222Ma' },
];

export function checkAdminCredentials(cni: string, pass: string): boolean {
    return ADMIN_CREDENTIALS.some(cred => cred.cni === cni && cred.password === pass);
}

export function generateToken(cni: string, pass: string): string {
    return btoa(`${cni}:${pass}`);
}

export function verifyAdmin(request: Request): boolean {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    try {
        const decoded = atob(token);
        const [cni, password] = decoded.split(':');
        return checkAdminCredentials(cni, password);
    } catch (e) {
        console.error("Token decoding failed:", e);
        return false;
    }
}
