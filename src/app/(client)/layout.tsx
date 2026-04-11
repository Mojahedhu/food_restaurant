import Header from "@/components/common/header";
import Footer from "@/components/home/footer";
import React from "react";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default ClientLayout;
