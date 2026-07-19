import { client } from "@/sanity/lib/client";
import auth from "@/../auth";
import { Order, User } from "@/../types/sanityTypes";
import DashboardClientPage from "./dashboardClientPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchUserDashboardOrders } from "@/lib/services/user.dashboard.service";

export const metadata: Metadata = {
  title: "Account Dashboard",
  description:
    "Manage your recent orders, saved addresses, and profile settings.",
};

async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";

  // Clean Server-Layer Pattern: Data fetching logic is delegated to the service layer
  const initialOrders = await fetchUserDashboardOrders(userId, isAdmin);
  return (
    <DashboardClientPage
      userId={userId}
      initialOrders={initialOrders}
      isAdmin={isAdmin}
      user={session?.user as User}
    />
  );
}

export default UserDashboardPage;
