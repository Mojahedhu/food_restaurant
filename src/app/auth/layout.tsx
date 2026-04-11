import React from "react";
import auth from "../../../auth";
import { redirect } from "next/navigation";

const RootLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const user = await auth();

  if (user?.user) {
    redirect("/");
  }

  return <> {children}</>;
};

export default RootLayout;
