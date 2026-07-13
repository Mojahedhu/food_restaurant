import { Building, Home, MapPin } from "lucide-react";

export const IconsPicker = ({ type }: { type: string }) => {
  if (type === "home") {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800">
        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (type === "work") {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20">
        <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800">
      <MapPin className="h-5 w-5 text-gray-400" />
    </div>
  );
};
