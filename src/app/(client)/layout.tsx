import Header from "@/components/common/header";
import { PageTransition } from "@/components/common/page-transition";
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
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
