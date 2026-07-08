import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth gate — this runs on every request to any /admin page
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 pt-16 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
