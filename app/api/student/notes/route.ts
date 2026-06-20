import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { title = '', content } = await req.json()

  const note = await prisma.note.create({
    data: { userId: user.id, title, content },
  })

  return NextResponse.json(note, { status: 201 })
}
