import React from "react";
import CartItems from "./cartItems";
import CartSummaryWrapper from "./cartSummaryWrapper";
import { client } from "@/sanity/lib/client";
import { Address } from "../../../sanity.types";

interface CartLayoutProps {
  isAuthenticated: boolean;
  username: string | undefined;
  userEmail: string | undefined;
  hasAddresses: boolean;
  userId: string | undefined;
}
const CartLayout = async ({
  isAuthenticated,
  username,
  userEmail,
  hasAddresses,
  userId,
}: CartLayoutProps) => {
  const address: Address[] = await client.fetch(
    `*[_type == "address" && user._ref == $userId]{
  _id,
  type,
  street,
  city,
  state,
  isDefault
 }
`,
    {
      userId,
    },
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <CartItems />
      </div>
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-6">
          <CartSummaryWrapper
            isAuthenticated={isAuthenticated}
            userName={username}
            userEmail={userEmail}
            hasAddresses={hasAddresses}
            userId={userId}
            address={address}
          />
        </div>
      </div>
    </div>
  );
};

export default CartLayout;
