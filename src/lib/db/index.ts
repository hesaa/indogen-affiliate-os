import { drizzle } from './schema';
import { drizzleConfig } from '~/drizzle.config';
import { Database } from './schema';

const db = drizzle(drizzleConfig);

export type { Database };
export { db, drizzle };