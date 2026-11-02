import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const email = session?.user?.email;

  // Anyone who is not the admin sees a 404, as if the page does not exist
  if (!isAdminEmail(email)) {
    notFound();
  }

  // No secret is passed to the browser: the API checks the session cookie itself
  return <AdminDashboardClient adminEmail={email} />;
}
