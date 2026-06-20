import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, content } = await req.json();
    const noteId = params.noteId;

    // بررسی مالکیت یادداشت
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // به‌روزرسانی یادداشت
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: title || '',
        content: content
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const noteId = params.noteId;

    // بررسی مالکیت یادداشت
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // حذف یادداشت
    await prisma.note.delete({
      where: { id: noteId }
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}