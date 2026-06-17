import React from "react";
import { RecentActivityItem } from "../types/dashboard";

export function ActivityList({
  activities,
}: {
  activities: RecentActivityItem[];
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return "📦";
      case "user":
        return "👤";
      case "review":
        return "⭐";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

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
        🔔 Recent Activity
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {(activities || []).map((activity) => (
          <div
            key={activity._id}
            className={`flex item-center gap-4 p-3 bg-[#18181f] rounded-[8px] border-l-4 ${activity._type === "order" ? "border-l-[#10b981]" : activity._type === "review" ? "border-l-[#fbbf24]" : "border-l-[#3b82f6]"}`}
          >
            <span style={{ fontSize: "20px" }}>{getIcon(activity._type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {activity.title}
              </div>
              <div style={{ fontSize: "12px", color: "#88888b" }}>
                {activity.subtitle} - {formatTime(activity._createdAt)}
              </div>
            </div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <div
            style={{ textAlign: "center", color: "#88888b", padding: "20px" }}
          >
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
