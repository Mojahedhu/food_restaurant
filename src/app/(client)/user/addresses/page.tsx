import React from "react";
import AddressesPage from "./addressPageClient";
import auth from "../../../../../auth";

const AddressPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  return <AddressesPage userId={userId} />;
};

export default AddressPage;
