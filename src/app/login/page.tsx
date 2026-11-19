import { redirect } from "next/navigation";
import { EmailPasswordAuthForm } from "@/components/auth/AuthCard";
import { auth } from "@/lib/auth/server";

export const instant = false;

export default async function LoginPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <EmailPasswordAuthForm mode="login" />;
}
