"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface AuthModalProps {
  children: ReactNode;
}

const AuthModal = ({ children }: AuthModalProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => router.back()}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-modal-enter"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-background/80 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
          onClick={() => router.back()}
          aria-label="Close auth modal"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="max-h-[min(760px,calc(100dvh-3rem))] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
