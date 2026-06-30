"use client";
import { RestaurantDetails } from "@/types/admin";
import { useRestaurantLogic } from "@/hooks/useRestaurantLogic";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
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
import { MapPin, Phone, Edit, Utensils } from "lucide-react";
import Image from "next/image";

interface RestaurantListProps {
  initialRestaurants: RestaurantDetails[];
}

export function RestaurantList({ initialRestaurants }: RestaurantListProps) {
  const { handleToggleActive, optimisticActiveStates, isPending } =
    useRestaurantLogic();

  return (
    <div className="space-y-4">
      {/* Restaurants Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Restaurant</TableHead>
              <TableHead>Location & Contact</TableHead>
              <TableHead className="w-[120px]">Delivery rules</TableHead>
              <TableHead className="w-[100px] text-center">Featured</TableHead>
              <TableHead className="w-[100px] text-center">
                Order status
              </TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRestaurants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No restaurants found.
                </TableCell>
              </TableRow>
            ) : (
              initialRestaurants.map((res) => {
                const isActive =
                  optimisticActiveStates[res._id] !== undefined
                    ? optimisticActiveStates[res._id]
                    : res.isActive;

                return (
                  <TableRow
                    key={res._id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {/* Restaurant Info Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0">
                          {res.image ? (
                            <Image
                              src={urlFor(res.image).url()}
                              alt={res.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <Utensils className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none">
                            {res.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {res.slug.current}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location Cell */}
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {res.location.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{res.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Delivery details */}
                    <TableCell>
                      <div className="text-xs space-y-0.5 font-medium">
                        <p>
                          Fee:{" "}
                          <span className="text-slate-950">
                            ${res.deliveryFee}
                          </span>
                        </p>
                        <p>
                          Min Order:{" "}
                          <span className="text-slate-950">
                            ${res.minimumOrder}
                          </span>
                        </p>
                        <p>
                          ETA:{" "}
                          <span className="text-slate-950">
                            {res.estimatedDeliveryTime}m
                          </span>
                        </p>
                      </div>
                    </TableCell>

                    {/* Featured Status badge */}
                    <TableCell className="text-center">
                      {res.isFeatured ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Active toggle */}
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Switch
                          checked={isActive}
                          disabled={isPending}
                          onCheckedChange={() =>
                            handleToggleActive(res._id, isActive)
                          }
                        />
                        <span
                          className={`text-xs font-semibold w-10 text-left ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}
                        >
                          {isActive ? "Open" : "Closed"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Edit button */}
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Link href={`/admin/settings?id=${res._id}`}>
                          <Edit className="size-3.5 mr-1" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
