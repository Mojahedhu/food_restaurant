import React from "react";
import { Grid } from "@sanity/ui";
import { DashboardData } from "../types/dashboard";

export function MetricCards({ data }: { data: DashboardData | null }) {
  const cards = [
    {
      emoji: "🍔",
      title: "Total Food Items",
      value: data?.foodItemsCount ?? 0,
      bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
    {
      emoji: "📦",
      title: "Total Orders",
      value: data?.ordersCount ?? 0,
      bg: "linear-gradient(135deg, #10b981, #047857)",
    },
    {
      emoji: "👥",
      title: "Customers",
      value: data?.customersCount ?? 0,
      bg: "linear-gradient(135deg, #f59e0b, #b45309)",
    },
    {
      emoji: "⭐",
      title: "Reviews",
      value: data?.reviewsCount ?? 0,
      bg: "linear-gradient(135deg, #ef4444, #b91c1c)",
    },
    {
      emoji: "📁",
      title: "Categories",
      value: data?.categoriesCount ?? 0,
      bg: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    },
    {
      emoji: "🎏",
      title: "Active Banners",
      value: data?.bannersCount ?? 0,
      bg: "linear-gradient(135deg, #ec4899, #be185d)",
    },
  ];

  return (
    <div
      style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        📊 Quick Food Overview
      </h3>
      <Grid gridTemplateColumns={[2, 3, 6]} gap={3}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: card.bg,
              borderRadius: "8px",
              padding: "16px",
              color: "#fff",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>
              {card.emoji}
            </div>
            <div
              style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {card.value}
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}
