import { sql } from '@vercel/postgres';

// Note: The Vercel Postgres SDK automatically uses the POSTGRES_URL
// environment variable. No need to manually create a pool.

export default sql;
