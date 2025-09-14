import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
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

    const { id: courseId } = await params
    const { studentEmail } = await request.json()

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      )
    }

    // Find the student by email
    const student = await prisma.user.findUnique({
      where: { 
        email: studentEmail,
        role: 'STUDENT'
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found with this email' },
        { status: 404 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check if student is enrolled in any other course
    const otherEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId: student.id
      }
    })

    if (otherEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in another course. Students can only be enrolled in one course at a time.' },
        { status: 400 }
      )
    }

    // Enroll the student
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: student.id,
        courseId: courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Student enrolled successfully',
      enrollment
    })
  } catch (error) {
    console.error('Error enrolling student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { id: courseId } = await params
    const { studentEmail } = await request.json()

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      )
    }

    // Find the student by email
    const student = await prisma.user.findUnique({
      where: { 
        email: studentEmail,
        role: 'STUDENT'
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found with this email' },
        { status: 404 }
      )
    }

    // Remove the enrollment
    await prisma.courseEnrollment.deleteMany({
      where: {
        userId: student.id,
        courseId: courseId
      }
    })

    return NextResponse.json({
      message: 'Student unenrolled successfully'
    })
  } catch (error) {
    console.error('Error unenrolling student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
