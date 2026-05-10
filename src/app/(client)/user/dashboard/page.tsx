import { client } from "@/sanity/lib/client";
import auth from "../../../../../auth";
import { Order, User } from "../../../../../types/sanityTypes";
import DashboardClientPage from "./dashboardClientPage";

const UserDashboardPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  const isAdmin = role === "admin";

  const query = isAdmin
    ? `*[_type == "order"] | order(_createdAt desc) [0...5]`
    : `*[_type == "order" && user._ref == $userId] | order(_createdAt desc) [0...5]`;

  const initialOrders = isAdmin
    ? await client.fetch<Order[]>(query)
    : await client.fetch<Order[]>(query, { userId });

  return (
    <DashboardClientPage
      userId={userId!}
      initialOrders={initialOrders}
      isAdmin={isAdmin}
      user={session?.user as User}
    />
  );
};

export default UserDashboardPage;
