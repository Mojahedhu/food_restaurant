import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Order, OrderSummary } from "@/../types/sanityTypes";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export default function OrderItemsList({ items }: { items: Order["items"] }) {
  return (
    <Card className="lg:col-span-2 shadow-sm border-border/60">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-primary" /> Order Items
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {(items || []).map((item, idx: number) => {
            const image = urlFor(item?.image || "").url();

            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border">
                  {item.image ? (
                    <Image
                      src={image}
                      alt={item.name || ""}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    {item.size && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-4"
                      >
                        {item.size}
                      </Badge>
                    )}
                    {item.variety && <span>• {item.variety}</span>}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-sm">
                    ${(item.price || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
