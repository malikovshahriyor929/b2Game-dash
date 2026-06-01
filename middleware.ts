import { withAuth } from "next-auth/middleware";
import { authSecret } from "@/lib/auth";

export default withAuth({
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
