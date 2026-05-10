import CartItems from "./cartItems";
import CartSummaryWrapper from "./cartSummaryWrapper";

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
          />
        </div>
      </div>
    </div>
  );
};

export default CartLayout;
