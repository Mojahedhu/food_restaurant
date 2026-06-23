"use client";

import { useState } from "react";
import { ReviewSummary } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Send, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ReviewDetailsProps {
  review: ReviewSummary;
  isOpen: boolean;
  onClose: () => void;
  onReply: (reviewId: string, replyText: string) => Promise<boolean>;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

export function ReviewDetailsDialog({
  review,
  isOpen,
  onClose,
  onReply,
  onApprove,
  onReject,
}: ReviewDetailsProps) {
  const [replyText, setReplyText] = useState(review.adminReply || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyText.trim() || replyText.trim() === review.adminReply) return;

    setSubmitting(true);
    const success = await onReply(review._id, replyText.trim());
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Review Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submitted by {review.user?.name || "Anonymous"} on{" "}
            {format(new Date(review._createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User & Item Context */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded-lg border">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">
                Customer
              </span>
              <span className="font-semibold block">
                {review.user?.name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground truncate block">
                {review.user?.email || "No email"}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">
                Food Item
              </span>
              <span className="font-semibold block">
                {review.food?.name || "Unknown Food"}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
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
            </div>
          </div>

          {/* Review Message */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              User Comment
            </Label>
            <div className="text-sm bg-muted/20 border p-3 rounded-lg leading-relaxed italic text-foreground">
              &quot;{review.comment}&quot;
            </div>
          </div>

          {/* Admin Response Section */}
          <form onSubmit={handleSubmitReply} className="space-y-2">
            <Label
              htmlFor="adminReply"
              className="text-xs font-semibold text-muted-foreground flex items-center justify-between"
            >
              <span>Admin Reply Response</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Max 1000 characters
              </span>
            </Label>
            <Textarea
              id="adminReply"
              placeholder="Write an official response to the customer feedback..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none h-24 text-sm"
              disabled={submitting}
            />

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              {/* Quick Status Control Buttons inside Dialog Footer */}
              <div className="flex gap-2 mr-auto">
                {review.approved ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-9 hover:cursor-pointer"
                    onClick={() => {
                      onReject(review._id);
                      onClose();
                    }}
                  >
                    <XCircle className="mr-1.5 size-4" /> Disapprove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 h-9 hover:cursor-pointer"
                    onClick={() => {
                      onApprove(review._id);
                      onClose();
                    }}
                  >
                    <CheckCircle className="mr-1.5 size-4" /> Approve
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-9 hover:cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !replyText.trim() ||
                    replyText.trim() === review.adminReply
                  }
                  className="h-9 hover:cursor-pointer"
                >
                  {submitting ? (
                    <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="mr-1.5 size-3.5" />
                  )}
                  Save Reply
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
