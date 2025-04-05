/**
 * Database migration script
 * 
 * This script generates and applies migrations for the database.
 * Used during development and deployment.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the root directory of the project
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

try {
  // Step 1: Generate migrations
  console.log('Generating database migrations...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit', cwd: rootDir });
  
  // Step 2: Push migrations to database
  console.log('\nPushing migrations to database...');
  execSync('npx drizzle-kit push', { stdio: 'inherit', cwd: rootDir });
  
  console.log('\n✅ Database migrations completed successfully!');
} catch (error) {
  console.error('\n❌ Error running database migrations:', error.message);
  process.exit(1);
} 