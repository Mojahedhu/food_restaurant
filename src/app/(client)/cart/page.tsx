import auth from "../../../../auth";
import { Breadcrumb } from "@/components/common/breadcrumb";
import Container from "@/components/common/container";
import CartLayout from "@/components/cart/cartLayout";
import { Metadata } from "next";
import { checkUserHasAddresses } from "@/lib/data/user";

export const metadata: Metadata = {
  title: "Shopping Cart | Food App",
  description: "Review your items and proceed to checkout securely.",
};

const CartPage = async () => {
  const session = await auth();

  // Fetch user Address if authenticated
  // Cleanly delegate the fetch to our data layer
  const hasAddresses = session?.user?.email
    ? await checkUserHasAddresses(session.user.email)
    : false;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Breadcrumb items={[{ label: "Shopping", href: "cart" }]} />
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
