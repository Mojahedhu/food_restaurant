import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Package, Truck } from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

const OrderActions = ({ orderId, onNavigate }: OrderActionsProps) => {
  return (
    <div className="space-y-3 pt-4">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg cursor-pointer"
        onClick={() => onNavigate(`/user/orders/${orderId}`)}
      >
        <Truck className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
        Track Your Order
        <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="w-full h-12 font-medium border-2 bg-muted/30 hover:bg-muted/80 transition-all duration-300 group cursor-pointer"
        onClick={() => onNavigate("/user/orders")}
      >
        <Package className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
        View All Orders
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="w-full h-12 font-medium border-2 bg-muted/30 hover:bg-muted/80 transition-all duration-300 group cursor-pointer"
        onClick={() => onNavigate("/")}
      >
        <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
        Back to Home
      </Button>
    </div>
  );
};

export default OrderActions;
