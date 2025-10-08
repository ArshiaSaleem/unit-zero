import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In serverless, Postgres connections can be dropped by the provider.
// Prefer a pooled connection when DATABASE_URL is available.
function buildPooledDatabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined
  try {
    const url = new URL(rawUrl)
    // If already configured, keep as-is
    if (url.searchParams.get('pgbouncer') === 'true') return rawUrl
    // Add pooling-friendly params
    url.searchParams.set('pgbouncer', 'true')
    // Keep connection concurrency extremely low per lambda
    url.searchParams.set('connection_limit', '1')
    // Avoid hanging on bad networks
    url.searchParams.set('connect_timeout', '15')
    return url.toString()
  } catch {
    return rawUrl
  }
}

const pooledUrl = buildPooledDatabaseUrl(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasources: { db: { url: pooledUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
