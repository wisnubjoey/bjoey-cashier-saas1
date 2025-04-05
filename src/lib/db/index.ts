import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('Warning: DATABASE_URL is not set in .env.local');
}

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
