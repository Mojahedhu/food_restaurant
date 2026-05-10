import React from "react";

const CardAddressSkeleton = () => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex items-center justify-start gap-2">
        <div className="h-5 w-20 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        <div className="h-21 w-full bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export default CardAddressSkeleton;
