// Prisma client singleton for Nuxt server (Prisma 7 with adapter)
import { PrismaClient } from '../../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Parse connection string and configure SSL
  const connectionUrl = new URL(process.env.DATABASE_URL!)
  const pool = new pg.Pool({
    host: connectionUrl.hostname,
    port: Number(connectionUrl.port) || 5432,
    database: connectionUrl.pathname.slice(1),
    user: connectionUrl.username,
    password: decodeURIComponent(connectionUrl.password),
    ssl: connectionUrl.searchParams.get('sslmode')
      ? { rejectUnauthorized: false }
      : undefined,
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
