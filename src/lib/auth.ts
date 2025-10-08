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
  return bcrypt.hash(password, 12)
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
  console.log('[AUTH] authenticateUser start', { email })
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('[AUTH] user not found', { email })
    return null
  }

  if (!user.isActive) {
    console.log('[AUTH] user inactive', { email, isActive: user.isActive })
    return null
  }

  const hasHash = typeof user.password === 'string' && user.password.startsWith('$2')
  if (!hasHash) {
    console.log('[AUTH] stored password not a bcrypt hash', { email })
  }

  const isValidPassword = await verifyPassword(password, user.password)
  console.log('[AUTH] password compare result', { email, isValidPassword })
  if (!isValidPassword) {
    return null
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
