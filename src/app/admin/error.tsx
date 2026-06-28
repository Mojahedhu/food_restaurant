"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  const isUnauthorized =
    error.message.includes("Unauthorized access") ||
    error.message.includes("Admin privileges required");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 bg-red-50 rounded-full dark:bg-red-950/20 mb-6">
        <Lock className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
        {isUnauthorized ? "Access Denied" : "Something went wrong"}
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {isUnauthorized
          ? "You do not have the required administrative permissions to view this section of the dashboard."
          : "An unexpected error occurred while loading the admin panel data."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isUnauthorized ? (
          <>
            <Button asChild variant="default">
              <Link href="/auth/signin?callbackUrl=/admin">
                Sign In as Admin
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => reset()} variant="default">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
