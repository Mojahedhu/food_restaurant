import auth from "@/../auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();

  if (user?.user?.email) {
    redirect("/");
  }

  return children;
}
