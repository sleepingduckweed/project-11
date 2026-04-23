import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase();
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const admin = await Admin.findOne({ email: credentials.email });
        if (!admin) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
