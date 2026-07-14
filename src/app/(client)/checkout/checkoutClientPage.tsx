"use client";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useLiveAddress } from "@/hooks/useLiveAddress";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PaymentLoadingModal from "@/features/checkout/components/paymentLoadingModal";
import { useCartStore } from "@/stores/cart/cartStore";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { DeliveryAddressCard } from "@/features/checkout/components/deliveryAddressCard";
import { PaymentMethodSelector } from "@/features/checkout/components/paymentMethodSelector";
import { OrderItemsList } from "@/features/checkout/components/orderItemsList";
import { OrderSummarySidebar } from "@/features/checkout/components/orderSummarySidebar";
import { ShoppingCart } from "lucide-react";

interface CheckoutClientPageProps {
  addressId: string;
  userId?: string;
  session: Session | null;
}

const DELIVERY_FEE = 5.0;

const CheckoutClientPage = ({
  addressId,
  userId,
  session,
}: CheckoutClientPageProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );

  // Global Stores
  const { addresses } = useAddressStore();
  const initializingAddress = useAddressStore((state) => state.ui.initializing);
  const { items, _hasHydrated } = useCartStore();

  // Custom Hooks
  useLiveAddress(userId);
  const { handlePlaceOrder, loading, orderLoading } = useCheckout();

  // Derived State Lookups
  const isReady = _hasHydrated && mounted;
  const address = addresses.find((addr) => addr._id === addressId);

  // Local UI Calculations (Sanity verified on backend)
  const subTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = Number((subTotal * 0.1).toFixed(2));

  const total = Number((subTotal + tax + DELIVERY_FEE).toFixed(2));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [isReady, router, items.length]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full animate-pulse gap-4">
        <ShoppingCart size={120} className="text-primary/20" />
        <p className="text-muted-foreground font-medium">
          Preparing secure checkout...
        </p>
      </div>
    );
  }

  // Prevent flash rendering before the redirect fires in useEffect
  if (items.length === 0) return null;

  const onPlaceOrder = () => {
    if (!address) {
      toast.error("Please select a valid delivery address");
      return;
    }

    // Strip client-only state variables before mutation dispatch
    const cleanedAddress = { ...address };
    delete cleanedAddress.isDefault;
    handlePlaceOrder({
      items,
      deliveryAddress: cleanedAddress,
      paymentMethod,
      userId,
      session,
    });
  };
  console.log("items", items);
  console.log("address", address);
  console.log("paymentMethod", paymentMethod);
  console.log("userId", userId);
  console.log("session", session);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
      <div className="lg:col-span-2 space-y-6">
        {/* {initializingAddress ? (
          <Card className="flex flex-col gap-6! drop-shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2 animate-pulse">
                <div className="h-5 w-5 rounded-full bg-muted"></div>
                <div className="h-5 w-20 rounded-md bg-muted"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 animate-pulse">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg h-20"></div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col gap-6! drop-shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary " />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="shrink-0">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize text-[16px]">
                      {defaultAddress?.type || "Type is Empty"}
                    </span>
                    <Badge variant={"secondary"}>
                      {defaultAddress?.label || "Label is Empty"}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">
                    {defaultAddress?.country || "Country is Empty"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {defaultAddress?.zipCode || "Zip code is Empty"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {defaultAddress?.state}, {defaultAddress?.city},{" "}
                    {defaultAddress?.street}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone: {defaultAddress?.phone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    “{defaultAddress?.instructions || "No instructions"}”
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
        <DeliveryAddressCard
          address={address}
          isLoading={initializingAddress}
        />
        {/* <Card className="flex flex-col gap-6! drop-shadow-xl">
          <CardHeader className="grid-rows-[auto_auto]">
            <CardTitle className="leading-none font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary " />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="space-y-3">
              <button
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  selectedPaymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
                onClick={() => setSelectedPaymentMethod("online")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">
                    Online Payment (Stripe)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pay securely with credit/debit online
                  </p>
                </div>
                {selectedPaymentMethod === "online" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </button>
              <button
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  selectedPaymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
                onClick={() => setSelectedPaymentMethod("cod")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pay when you receive your order
                  </p>
                </div>
                {selectedPaymentMethod === "cod" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>
          </CardContent>
        </Card> */}
        <PaymentMethodSelector
          selected={paymentMethod}
          onSelect={setPaymentMethod}
        />
        {/* {_hasHydrated && items.length > 0 ? (
          <Card className="flex flex-col gap-6! drop-shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                <Container className="h-5 w-5 text-primary " />
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted relative shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Utensils className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col gap-6! drop-shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2 animate-pulse">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="h-5 w-40 rounded-md bg-muted"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted relative shrink-0"></div>
                    <div className="flex-1 min-w-0 bg-muted h-5 rounded-lg"></div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm bg-muted h-3 w-10 rounded-lg mb-1"></p>
                      <p className="text-xs text-muted-foreground bg-muted h-3 w-10 rounded-lg"></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}
        <OrderItemsList items={items} isHydrated={_hasHydrated} />
      </div>
      <div className="lg:col-span-1">
        {/* <Card className="drop-shadow-lg sticky top-24">
          <CardHeader className="grid-rows-[auto_auto]">
            <CardTitle className="leading-none font-semibold flex items-center gap-2">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Estimated delivery: 30-45 minutes</p>
              <p>• Payment method: Online (Stripe)</p>
              <p>• All prices include applicable taxes</p>
            </div>
            <Button
              className="font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 h-fit py-4! px-12! text-lg! border border-primary bg-primary text-primary-foreground hover:border-primary w-full group/button"
              onClick={handlePlaceOrder}
            >
              <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary-foreground -translate-x-full group-hover/button:translate-x-0"></span>

              <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary">
                <CheckCircle className="h-5 w-5 mr-2" />
                Place Order
              </span>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you agree to our terms and conditions
            </p>
          </CardContent>
        </Card> */}
        <OrderSummarySidebar
          subTotal={subTotal}
          tax={tax}
          deliveryFee={DELIVERY_FEE}
          total={total}
          paymentMethod={paymentMethod}
          onPlaceOrder={onPlaceOrder}
          disabled={!address || loading}
        />
      </div>
      {/* Renders your original Loading Overlay seamlessly */}
      <PaymentLoadingModal isOpen={loading} orderLoading={orderLoading} />
    </div>
  );
};

export default CheckoutClientPage;
