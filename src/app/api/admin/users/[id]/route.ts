import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { action, ...data } = await request.json()

    if (action === 'resetPassword') {
      const user = await prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const defaultPassword = user.role === 'STUDENT' 
        ? process.env.DEFAULT_STUDENT_PASSWORD!
        : user.role === 'TEACHER'
        ? process.env.DEFAULT_TEACHER_PASSWORD!
        : 'admin123' // Admin password

      const hashedPassword = await hashPassword(defaultPassword)

      await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          mustChangePassword: user.role !== 'ADMIN' // Only non-admins need to change password
        }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'toggleActive') {
      await prisma.user.update({
        where: { id },
        data: { isActive: data.isActive }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
