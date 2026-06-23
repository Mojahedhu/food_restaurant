"use client";

import { ReviewMetricsSummary } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, AlertCircle } from "lucide-react";

interface ReviewMetricsProps {
  metrics: ReviewMetricsSummary;
}

export function ReviewMetricsCards({ metrics }: ReviewMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Average Score Card */}
      <Card className="relative overflow-hidden border bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="size-4 text-amber-500 fill-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-baseline gap-2">
            {metrics.averageRating.toFixed(1)}{" "}
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-3.5 ${
                  star <= Math.round(metrics.averageRating)
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Reviews Card */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <MessageSquare className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalReviews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted comments
          </p>
        </CardContent>
      </Card>

      {/* Pending Approvals Card */}
      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">
            Pending Moderation
          </CardTitle>
          <AlertCircle
            className={`size-4 ${metrics.pendingReviews > 0 ? "text-destructive animate-pulse" : "text-emerald-500"}`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pendingReviews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.pendingReviews > 0 ? "Needs admin approval" : "All clean!"}
          </p>
        </CardContent>
      </Card>

      {/* Stars Distribution Chart (Virtual Card) */}
      <Card className="border bg-card col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Rating Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-1">
          {metrics.distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center text-xs gap-2">
              <span className="w-3 text-right font-medium">{dist.stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">
                {dist.percentage}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
