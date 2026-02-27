import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    url: process.env.DATABASE_URL,
  },

  migrations: {
    seed: 'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },

  // Prisma 7 runtime adapter
  // @ts-expect-error tipos ainda não atualizados
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
})
