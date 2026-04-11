import React from "react";
import auth from "../../../../auth";
import { client } from "@/sanity/lib/client";
import { Breadcrumb } from "@/components/common/breadcrumb";
import Container from "@/components/common/container";
import CartLayout from "@/components/cart/cartLayout";

const CartPage = async () => {
  const session = await auth();

  // Fetch user Address if authenticated
  let hasAddresses = false;
  if (session?.user?.email) {
    try {
      const userWithAddresses = await client.fetch(
        `*[_type == "user" && email == $email][0]{
        "hasAddresses": count(addresses) > 0
      }`,
        { email: session.user.email },
      );
      hasAddresses = userWithAddresses?.hasAddresses || false;
    } catch (error) {
      console.error("Error fetching user addresses", error);
    }
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shopping", href: "cart" },
        ]}
      />
      <main className="py-8 md:py-12">
        <Container>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2">
              Shopping cart
            </h1>
            <p className="text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>

          {/* Responsive grid layout */}
          <CartLayout
            isAuthenticated={!!session}
            username={session?.user?.name || undefined}
            userEmail={session?.user?.email || undefined}
            hasAddresses={hasAddresses}
            userId={session?.user?.id || undefined}
          />
        </Container>
      </main>
    </div>
  );
};

export default CartPage;
