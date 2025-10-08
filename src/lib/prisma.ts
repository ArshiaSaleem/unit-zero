import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Force direct connection to avoid pooling issues
function getDirectConnectionUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) return undefined
  
  try {
    const url = new URL(rawUrl)
    
    // Force direct connection (not pooled)
    url.searchParams.set('direct', 'true')
    url.searchParams.set('sslmode', 'require')
    
    return url.toString()
  } catch {
    return rawUrl
  }
}

const directUrl = getDirectConnectionUrl()

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
    datasources: { 
      db: { url: directUrl } 
    } 
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
