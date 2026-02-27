import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login", // Garante que quem não logar vai pra cá
  },
});

export const config = { 
  matcher: ["/admin/dashboard/:path*"] 
};