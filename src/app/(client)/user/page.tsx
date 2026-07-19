import { redirect } from "next/navigation";

function UserDashboardPage() {
  // Seamlessly redirect root /user hits to the primary dashboard hub
  return redirect("/user/dashboard");
}

export default UserDashboardPage;
