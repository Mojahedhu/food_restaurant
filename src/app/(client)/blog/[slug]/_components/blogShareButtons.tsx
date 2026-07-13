"use client";

import { useEffect, useState } from "react";
import { Facebook, Twitter, Linkedin, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogShareButtonsProps {
  title: string;
}

export default function BlogShareButtons({ title }: BlogShareButtonsProps) {
  const [url, setUrl] = useState("");

  // Safely grab URL on the client to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(window.location.href);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-12 mb-8 pt-8 border-t border-gray-100">
      <span className="font-semibold text-gray-700 mr-2">
        Share this article:
      </span>

      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full hover:text-blue-600 hover:border-blue-600 transition-colors"
        >
          <Facebook className="h-4 w-4" />
        </Button>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full hover:text-sky-500 hover:border-sky-500 transition-colors"
        >
          <Twitter className="h-4 w-4" />
        </Button>
      </a>
      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full hover:text-blue-700 hover:border-blue-700 transition-colors"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
      </a>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full hover:text-primary hover:border-primary transition-colors"
        onClick={copyToClipboard}
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
