import ContactHelpSkeleton from "./contactHelpSkeleton";
import ContactInfoSkeleton from "./contactInfoSkeleton";
import ContactMsgSkeleton from "./contactMsgSkeleton";

function ContactBodySkeleton() {
  return (
    <section className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <ContactInfoSkeleton />
        <ContactHelpSkeleton />
      </div>

      <ContactMsgSkeleton />
    </section>
  );
}

export default ContactBodySkeleton;
