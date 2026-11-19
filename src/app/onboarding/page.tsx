import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function OnboardingPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const existingVendor = await prisma.vendor.findUnique({
    where: { authUserId: session.user.id },
    select: { id: true },
  });

  if (existingVendor) {
    redirect("/dashboard");
  }

  return <OnboardingForm email={session.user.email} />;
}
