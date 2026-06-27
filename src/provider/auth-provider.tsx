"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let updated = false;

      // Clean up OAuth query parameters returned by providers (like Google)
      // that are preserved by Netlify redirects.
      const oauthParams = [
        "code",
        "state",
        "iss",
        "session_state",
        "scope",
        "authuser",
        "prompt",
      ];
      oauthParams.forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          updated = true;
        }
      });

      if (updated) {
        // Construct the clean URL (pathname + any remaining search params + hash)
        const cleanUrl = url.pathname + url.search + url.hash;
        window.history.replaceState(
          { ...window.history.state, as: cleanUrl, url: cleanUrl },
          "",
          cleanUrl
        );
      }
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
};
