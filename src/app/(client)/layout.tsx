import Header from "@/components/common/header";
import Footer from "@/components/home/footer";
import React, { ViewTransition } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
  authModal: React.ReactNode;
}

const ClientLayout = ({ children, authModal }: ClientLayoutProps) => {
  return (
    <div>
      <Header />

      {authModal}
      <ViewTransition name="client-route">{children}</ViewTransition>
      <Footer />
    </div>
  );
};

export default ClientLayout;
