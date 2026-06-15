import { Breadcrumb } from "@/components/common/breadcrumb";
import ContactHero from "./_components/contactHero";
import ContactBody from "./_components/contactBody";
import ContactMap from "./_components/contactMap";

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ href: "contact", label: "Contact" }]} />
      <ContactHero />
      <ContactBody />
      <ContactMap />
    </div>
  );
}

export default ContactPage;
