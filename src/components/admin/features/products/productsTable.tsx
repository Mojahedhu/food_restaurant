// src/components/admin/features/products/productsTable.tsx
"use client";

import { ProductSummary } from "@/types/admin";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useProductsLogic } from "@/hooks/useProductsLogic";
import { useState } from "react";
import Image from "next/image";
import { Edit, ExternalLink, Package, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetailsSheet } from "./productDetailsSheet";
import { AlertFoodDelete } from "./AlertFoodDelete";

interface ProductsTableProps {
  initialProducts: ProductSummary[];
  categories: Array<{ _id: string; name: string }>;
  varieties: Array<{ _id: string; name: string }>;
  sizes: Array<{ _id: string; name: string }>;
  ingredients: Array<{ _id: string; name: string }>;
}

export function ProductsTable({
  initialProducts,
  categories,
  varieties,
  sizes,
  ingredients,
}: ProductsTableProps) {
  // 1. Hook up the custom products logic hook
  const {
    products,
    isPending,
    handleToggleAvailability,
    handleSaveProduct,
    handleDeleteProduct,
  } = useProductsLogic(initialProducts);
  console.log(initialProducts);

  // 2. Local state for edit sheet
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductSummary | null>(
    null,
  );

  return (
    <div className="relative w-full overflow-auto">
      {/* Top progress indicator for background transitions */}
      {isPending && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-pulse z-50" />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Menu Items</h2>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            // Creation mode
            setIsSheetOpen(true);
          }}
          className="hover:cursor-pointer shadow-xs"
        >
          <Plus className="size-4 mr-2" /> Add Product
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-transparent border-b">
            <TableHead className="w-[80px] font-medium pl-4">Image</TableHead>
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Price</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="text-right font-medium pr-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(products || []).length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            (products || []).map((product) => {
              const foodImage = product.images || "";
              const displayImage = getImageUrl(foodImage[0]);

              return (
                <TableRow
                  key={product._id}
                  className="hover:bg-slate-50/50 transition-colors border-b last:border-b-0"
                >
                  {/* Image Cell */}
                  <TableCell className="pl-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border bg-slate-100 flex items-center justify-center shadow-sm">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={product.name || "Food Item"}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <Package className="size-5 text-muted-foreground opacity-50" />
                      )}
                    </div>
                  </TableCell>

                  {/* Name Cell */}
                  <TableCell className="font-semibold text-slate-900">
                    {product.name || "Unnamed"}
                  </TableCell>

                  {/* Category Cell */}
                  <TableCell className="text-muted-foreground">
                    {product.category?.name || "Uncategorized"}
                  </TableCell>

                  {/* Price Cell */}
                  <TableCell className="font-medium">
                    {formatCurrency(product.price || 0)}
                  </TableCell>

                  {/* Status Toggle Switch & Badge */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.available ?? false}
                        onCheckedChange={() =>
                          handleToggleAvailability(
                            product._id,
                            product.available ?? false,
                          )
                        }
                        className="data-[state=checked]:bg-primary"
                        disabled={isPending}
                      />
                      <Badge
                        variant="outline"
                        className={
                          product.available
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }
                      >
                        {product.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Edit & Studio Action Button Cell */}
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end items-center gap-2">
                      {isPending ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-50 cursor-not-allowed rounded-lg"
                          disabled
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          <a
                            href={`/studio-quick-food/structure/foodManagement;allFoodItems;${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Sanity Studio"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (product._id) {
                            setSelectedProduct(product);
                            setIsSheetOpen(true);
                          }
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                        disabled={isPending}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingProduct(product)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Slide-out Edit details Sheet */}
      <ProductDetailsSheet
        product={selectedProduct}
        categories={categories}
        varieties={varieties}
        sizes={sizes}
        ingredients={ingredients}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        isPending={isPending}
      />
      <AlertFoodDelete
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        productName={deletingProduct?.name || ""}
        isPending={isPending}
        onConfirm={async () => {
          if (deletingProduct) {
            await handleDeleteProduct(deletingProduct._id);
            setDeletingProduct(null);
          }
        }}
      />
    </div>
  );
}
