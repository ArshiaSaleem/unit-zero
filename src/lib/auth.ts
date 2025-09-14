import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

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
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string }
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
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.isActive) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password)
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
