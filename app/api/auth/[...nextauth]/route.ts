// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // ✅ اینجا id, role هر دو برمیگردن
        return {
          id: user.id,
          name: user.name ?? '',
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // user فقط اولین بار (هنگام login) وجود داره
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId
        session.user.role = token.role
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',        // ✅ صریح مشخص شده
    maxAge: 30 * 24 * 60 * 60, // 30 روز
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
