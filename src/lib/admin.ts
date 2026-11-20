import { auth } from "@/lib/auth/server";

/**
 * Verifies the current session belongs to the configured ADMIN_EMAIL.
 */
export async function getAdminSession() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return null;

  const { data: session } = await auth.getSession();
  if (!session?.user?.email) return null;

  if (session.user.email.toLowerCase() !== adminEmail) {
    return null;
  }

  return session.user;
}
