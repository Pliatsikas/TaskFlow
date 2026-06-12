import { redirect } from "next/navigation";

// The root page just redirects — actual pages are in /dashboard and /auth/login
export default function RootPage() {
  redirect("/dashboard");
  return null;
}
