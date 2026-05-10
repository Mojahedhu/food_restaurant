import { Breadcrumb } from "@/components/common/breadcrumb";
import CheckoutClientPage from "./checkoutClientPage";
import auth from "../../../../auth";

interface CheckoutPageProps {
  searchParams: Promise<{ addressId: string }>;
}
const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const { addressId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
        ]}
      />
      <main className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Review your order and complete payment
            </p>
          </div>
          <CheckoutClientPage
            addressId={addressId}
            userId={userId!}
            session={session!}
          />
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
