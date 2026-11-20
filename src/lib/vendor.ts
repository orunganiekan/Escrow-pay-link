import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the currently authenticated Neon Auth user and their Vendor profile.
 * Returns null if unauthenticated or onboarding has not been completed.
 */
export async function getAuthenticatedVendor() {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const vendor = await prisma.vendor.findUnique({
    where: { authUserId: session.user.id },
  });
  return vendor;
}
