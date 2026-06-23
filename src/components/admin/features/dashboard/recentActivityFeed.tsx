"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentActivity } from "@/types/admin";
import { formatCurrency, getUserImage } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { UserIcon, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { UserImage } from "../../../../../sanity.types";

interface Avatar {
  image: UserImage | undefined;
}

interface RecentActivityFeedProps {
  activity: RecentActivity;
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  return (
    <Card
      className="col-span-4 border border-border shadow-xs transition-all duration-500 ease-out transform animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: "450ms" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
          Recent System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <TabsTrigger
              value="orders"
              className="hover:cursor-pointer transition-all duration-200"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="hover:cursor-pointer transition-all duration-200"
            >
              New Users
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="hover:cursor-pointer transition-all duration-200"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Orders Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="orders"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent orders.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.recentOrders.map((ord, idx) => (
                  <div
                    key={ord._id}
                    className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors transform animate-in fade-in slide-in-from-left-4 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="size-9 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                        <ShoppingBag className="size-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {ord.userName || "Unnamed User"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Order #{ord.orderNumber} •{" "}
                          {formatDistanceToNow(new Date(ord._createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-slate-950">
                        {formatCurrency(ord.total || 0)}
                      </div>
                      <Badge
                        variant="outline"
                        className="scale-90 font-normal mt-1 border-slate-200"
                      >
                        {ord.status?.title || "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* New Users Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="users"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.newUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent sign-ups.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.newUsers.map((user, idx) => {
                  const avatar = getUserImage(user as Avatar);

                  return (
                    <div
                      key={user._id}
                      className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors transform animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex gap-3 items-center">
                        {/* Aspect Ratio Box prevents layout shifts */}
                        <div className="relative size-9 rounded-full border border-border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 aspect-square">
                          {avatar ? (
                            <Image
                              src={avatar}
                              alt={user.name || "avatar"}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <UserIcon className="size-4.5 text-muted-foreground/60" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {user.name || "Unnamed User"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="secondary"
                          className="scale-90 font-normal"
                        >
                          {user.role?.name || "User"}
                        </Badge>
                        <div className="text-xxs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(user._createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Recent Reviews Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="reviews"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent reviews.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.recentReviews.map((rev, idx) => {
                  const avatar = getUserImage(rev.user as Avatar);
                  return (
                    <div
                      key={rev._id}
                      className="p-4 hover:bg-slate-50/50 transition-colors transform animate-in fade-in slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          {/* Aspect Ratio Box prevents layout shifts */}
                          <div className="relative size-8 rounded-full border border-border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 aspect-square">
                            {avatar ? (
                              <Image
                                src={avatar}
                                alt={rev.user?.name || "avatar"}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon className="size-4 text-muted-foreground/60" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {rev.user?.name || "Anonymous"}
                            </div>
                            <div className="text-xxs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(rev._createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 fill-current ${i >= rev.rating ? "opacity-20" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xxs font-medium text-primary uppercase tracking-wider">
                          {rev.foodName}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
