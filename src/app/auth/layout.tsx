import React, { ViewTransition } from "react";
import auth from "../../../auth";
import { redirect } from "next/navigation";

const RootLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const user = await auth();

  if (user?.user?.email) {
    redirect("/");
  }

  return <ViewTransition name="auth-route">{children}</ViewTransition>;
};

export default RootLayout;
