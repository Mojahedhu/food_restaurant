"use client";

import { useState } from "react";
import { ReviewSummary } from "@/types/admin";
import { useReviewsLogic } from "@/hooks/useReviewsLogic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquareShare,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReviewDetailsDialog } from "./reviewDetailsDialog";
import { getUserImage } from "@/lib/utils";

interface ReviewsTableProps {
  initialReviews: ReviewSummary[];
}

export function ReviewsTable({ initialReviews }: ReviewsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    reviews,
    isPending,
    handleApprove,
    handleReject,
    handleReply,
    handleDelete,
  } = useReviewsLogic(initialReviews);

  const [selectedReview, setSelectedReview] = useState<ReviewSummary | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sorting Handler
  const currentSortBy = searchParams.get("sortBy") || "date";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field)
      return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
    return currentSortOrder === "asc" ? (
      <ArrowUp className="ml-1 size-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 size-3 text-primary" />
    );
  };

  return (
    <div className="relative rounded-md border bg-card overflow-hidden">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">
              Updating Reviews...
            </p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[150px]">Food Item</TableHead>
            <TableHead
              className="w-[120px] cursor-pointer hover:text-foreground"
              onClick={() => handleSort("rating")}
            >
              <span className="flex items-center">
                Rating {renderSortIcon("rating")}
              </span>
            </TableHead>
            <TableHead>Comment</TableHead>
            <TableHead
              className="w-[120px] cursor-pointer hover:text-foreground"
              onClick={() => handleSort("date")}
            >
              <span className="flex items-center">
                Submitted {renderSortIcon("date")}
              </span>
            </TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[60px] text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(reviews || []).length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="size-6 text-muted-foreground" />
                  <p>No reviews found matching the search criteria.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => {
              const avatar = review.user ? getUserImage(review.user) : "";
              return (
                <TableRow
                  key={review._id}
                  className="transition-colors hover:bg-muted/40"
                >
                  {/* User Cell */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={avatar || ""} />
                        <AvatarFallback>
                          <User className="size-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate max-w-[140px]">
                        <p className="text-sm font-semibold truncate">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {review.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Food Item Cell */}
                  <TableCell className="font-medium text-sm">
                    {review.food?.name || "Unknown Food"}
                  </TableCell>

                  {/* Rating Stars Cell */}
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>

                  {/* Comment Excerpt */}
                  <TableCell className="max-w-[280px]">
                    <div className="truncate text-sm">
                      <span className="text-foreground">{review.comment}</span>
                      {review.adminReply && (
                        <div className="mt-1 flex items-start gap-1.5 text-xs text-primary bg-primary/5 rounded p-1 border border-primary/10">
                          <span className="font-semibold shrink-0">Admin:</span>
                          <span className="truncate italic">
                            &quot;{review.adminReply}&quot;
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Submitted Date */}
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(review._createdAt), "MMM d, yyyy")}
                  </TableCell>

                  {/* Approval Status Badge */}
                  <TableCell>
                    {review.approved ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex w-fit items-center gap-1"
                      >
                        <CheckCircle className="size-3" /> Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 bg-amber-500/10 text-amber-500 flex w-fit items-center gap-1"
                      >
                        <AlertCircle className="size-3" /> Pending
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="size-8 p-0 hover:cursor-pointer"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="hover:cursor-pointer"
                          onClick={() => {
                            setSelectedReview(review);
                            setDetailsOpen(true);
                          }}
                        >
                          <MessageSquareShare className="mr-2 size-4 text-muted-foreground hover:cursor-pointer" />{" "}
                          View & Reply
                        </DropdownMenuItem>

                        {review.approved ? (
                          <DropdownMenuItem
                            className="hover:cursor-pointer"
                            onClick={() => handleReject(review._id)}
                          >
                            <XCircle className="mr-2 size-4 text-amber-500 hover:cursor-pointer" />{" "}
                            Disapprove
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleApprove(review._id)}
                            className="hover:cursor-pointer"
                          >
                            <CheckCircle className="mr-2 size-4 text-emerald-500 hover:cursor-pointer" />{" "}
                            Approve
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive hover:cursor-pointer"
                          onClick={() => handleDelete(review._id)}
                        >
                          <Trash2 className="mr-2 size-4" /> Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Selected Review Details Dialog */}
      {selectedReview && (
        <ReviewDetailsDialog
          review={selectedReview}
          isOpen={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedReview(null);
          }}
          onReply={handleReply}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
