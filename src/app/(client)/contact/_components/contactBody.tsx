import React from "react";
import ContactInfo from "./contactInfo";
import ContactHelp from "./contactHelp";
import ContactMsg from "./contactMsg";

function ContactBody() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <ContactInfo />
          <ContactHelp />
        </div>
        <div className="lg:col-span-2">
          <ContactMsg />
        </div>
      </div>
    </div>
  );
}

export default ContactBody;
