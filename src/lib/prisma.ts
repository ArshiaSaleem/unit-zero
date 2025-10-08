import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use Vercel's pooled connection URL if available, otherwise add SSL and pooling params
function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) return undefined
  
  // Check if we have a pooled URL (Vercel provides this)
  if (rawUrl.includes('pooler') || rawUrl.includes('pooled')) {
    return rawUrl
  }
  
  try {
    const url = new URL(rawUrl)
    
    // Force SSL for production stability
    url.searchParams.set('sslmode', 'require')
    
    // Add connection pooling parameters
    url.searchParams.set('pgbouncer', 'true')
    url.searchParams.set('connection_limit', '1')
    url.searchParams.set('connect_timeout', '10')
    url.searchParams.set('pool_timeout', '10')
    
    return url.toString()
  } catch {
    return rawUrl
  }
}

const optimizedUrl = getOptimizedDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasources: { db: { url: optimizedUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
