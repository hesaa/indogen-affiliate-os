import { drizzle } from 'drizzle-orm'
import { drizzleConfig } from 'drizzle-kit'

export default drizzleConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db',
  dialect: drizzle.PostgresDialect,
  emit: ['typings'],
  schemaOutput: './src/lib/db/schema.ts',
  schemaTypings: './src/lib/db/schema.ts',
})