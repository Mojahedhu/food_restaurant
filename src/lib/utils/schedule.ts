// src/lib/utils/schedule.ts
export function isRestaurantOpen(restaurant: {
  isActive: boolean;
  openingHours?: {
    name: string;
    schedule?: Array<{
      day: string;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  } | null;
}): boolean {
  if (!restaurant?.isActive) return false;
  if (!restaurant.openingHours?.schedule) return true; // Default to true if no schedule defined

  const today = new Date();
  const currentDayName = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase(); // e.g. "monday", "tuesday"

  const daySlot = restaurant.openingHours.schedule.find(
    (s) => s.day === currentDayName,
  );
  if (!daySlot || daySlot.isClosed) return false;

  // Format current local time in 24h format (HH:MM)
  const currentHours = String(today.getHours()).padStart(2, "0");
  const currentMinutes = String(today.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;
  console.log(currentTimeStr);

  return (
    currentTimeStr >= daySlot.openTime && currentTimeStr <= daySlot.closeTime
  );
}
