import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, username, email, password, role } = body

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'همه فیلدها الزامی هستند' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'ایمیل قبلاً ثبت شده' }, { status: 400 })
    }

    const existingUsername = await prisma.user.findFirst({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'نام کاربری قبلاً استفاده شده' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    
    // 🟢 مستقیماً role رو استفاده کن (همون STUDENT یا TEACHER)
    const userRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT'

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashed,
        role: userRole,
      },
    })

    // برگردوندن اطلاعات کامل کاربر برای لاگین خودکار
    return NextResponse.json({ 
      message: 'ثبت‌نام موفق', 
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role // 🟢 role رو برمی‌گردونیم
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}