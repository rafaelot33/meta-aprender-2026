import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "../../../lib/prisma"; // (ou "../../../../lib/prisma" se der erro)

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login", // Nossa página de login personalizada
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Busca o usuário no banco
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // 2. Verifica se a senha bate (usando bcrypt)
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 3. Retorna o usuário se tudo estiver ok
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});

export { handler as GET, handler as POST };