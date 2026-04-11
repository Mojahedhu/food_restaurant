import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary/5 via-secondary/30 to-accent/20">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-fit">
            <h1 className="text-[150px] font-bold leading-none text-primary/10 sm:text-[200px]">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">🍕</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 space-y-3">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Page Not Found
          </h2>

          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Oops! The page you&apos;re looking for seems to have been eaten.
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/menu">
              <Search className="mr-2 h-4 w-4" />
              Browse Menu
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm text-muted-foreground">
            Or try one of these pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/categories"
              className="text-primary transition-colors hover:underline"
            >
              Categories
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/about"
              className="text-primary transition-colors hover:underline"
            >
              About Us
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/contact"
              className="text-primary transition-colors hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
