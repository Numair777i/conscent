import { auth } from "@/auth";
import { notFound } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

const AUTHORIZED_ADMIN_EMAIL = "conscent7@gmail.com";

export default async function AdminPage() {
  const session = await auth();

  // If unauthenticated or authenticated with any email other than conscent7@gmail.com, show 404
  if (
    !session?.user?.email ||
    session.user.email.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL
  ) {
    notFound();
  }

  return (
    <AdminDashboardClient
      adminEmail={session.user.email}
      adminSecret={process.env.ADMIN_SECRET || ""}
    />
  );
}
