import auth from "@/../auth";
import { PageTransition } from "@/components/common/page-transition";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await auth();

  if (user?.user?.email) {
    redirect("/");
  }

  return <PageTransition>{children}</PageTransition>;
}
