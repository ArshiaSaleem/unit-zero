import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

// Use a resilient secret to avoid global auth outages if env is missing
// Prefer server envs, but fall back to a local default so APIs don't 500
const JWT_SECRET: string =
  process.env.JWT_SECRET ||
  process.env.NEXT_PUBLIC_JWT_SECRET ||
  'unit-zero-development-secret'

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  firstName?: string
  lastName?: string
  mustChangePassword: boolean
}

export async function hashPassword(password: string): Promise<string> {
  // Use lower rounds for serverless (Vercel free tier has 10s timeout)
  return bcrypt.hash(password, 8)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string }
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'TEACHER' | 'STUDENT',
      mustChangePassword: false // This will be fetched from DB when needed
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const inputEmail = (email || '').trim()
  console.log('[AUTH] authenticateUser start', { email: inputEmail })
  let user: any
  try {
    // Case-insensitive lookup to tolerate email casing differences
    user = await prisma.user.findFirst({
      where: { email: { equals: inputEmail, mode: 'insensitive' } }
    })
    // Fallback to exact match if needed
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: inputEmail } })
    }
  } catch (dbError) {
    console.error('[AUTH] prisma.findUnique error', dbError)
    // Surface a null so caller can respond gracefully; logs carry details
    return null
  }

  if (!user) {
    console.log('[AUTH] user not found', { email })
    return null
  }

  if (!user.isActive) {
    console.log('[AUTH] user inactive', { email: inputEmail, isActive: user.isActive })
    return null
  }

  const hasHash = typeof user.password === 'string' && user.password.startsWith('$2')
  if (!hasHash) {
    console.log('[AUTH] stored password not a bcrypt hash', { email: inputEmail })
    // Backward compatibility: allow plain-text equality once, then rehash
    if (password === user.password) {
      console.log('[AUTH] plain-text password matched; upgrading to bcrypt', { email: inputEmail })
      try {
        const newHash = await hashPassword(password)
        await prisma.user.update({ where: { id: user.id }, data: { password: newHash } })
      } catch (e) {
        console.error('[AUTH] failed to upgrade password hash', e)
      }
      // proceed as valid
    } else {
      return null
    }
  } else {
    const isValidPassword = await verifyPassword(password, user.password)
    console.log('[AUTH] password compare result', { email: inputEmail, isValidPassword })
    if (!isValidPassword) {
      return null
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    mustChangePassword: user.mustChangePassword
  }
}
