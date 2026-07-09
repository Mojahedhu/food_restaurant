import Header from "@/components/common/header";
import Footer from "@/components/home/footer";

interface ClientLayoutProps {
  children: React.ReactNode;
  authModal: React.ReactNode;
}

const ClientLayout = ({ children, authModal }: ClientLayoutProps) => {
  return (
    <div>
      <Header />

      {authModal}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
