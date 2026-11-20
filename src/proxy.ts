import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/login",
  publicRoutes: [
    "/",
    "/login",
    "/signup",
    "/p",
    "/o",
    "/api/health",
    "/api/orders",
    "/api/webhooks",
  ],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|icon\\.svg|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
