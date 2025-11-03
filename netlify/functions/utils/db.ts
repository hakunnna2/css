import { Pool } from 'pg';

let pool: Pool;

// Initialize the connection pool if it doesn't exist.
// This pattern prevents creating a new pool for every function invocation
// in the same container.
if (!pool) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // This configuration is often necessary for connecting to cloud databases
    // from serverless environments like Netlify Functions.
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export default pool;