import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/**
 * Ensures at least one admin user exists in the database.
 * On first run, creates a default admin with bcrypt-hashed password.
 */
async function ensureSeedAdmin(): Promise<void> {
  try {
    const adminCount = await db.user.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await db.user.create({
        data: {
          email: 'admin@luxestore.sa',
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('[Auth] Seed admin created: admin@luxestore.sa');
    }
  } catch (error) {
    console.error('[Auth] Failed to seed admin user:', error);
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('EMAIL_PASSWORD_REQUIRED');
        }

        // Ensure seed admin exists on first login attempt
        await ensureSeedAdmin();

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('INVALID_CREDENTIALS');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('INVALID_CREDENTIALS');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'luxe-store-demo-secret-key-change-in-production',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
};
