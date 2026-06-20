import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // دریافت نتایج ذخیره شده
    const savedResults = await prisma.savedResult.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' }
    })

    return NextResponse.json(savedResults.map(r => ({
      id: r.id,
      examId: r.examId,
      examTitle: r.examTitle,
      score: r.score,
      totalCorrect: r.totalCorrect,
      totalQuestions: r.totalQuestions,
      completedAt: r.completedAt
    })))
    
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}