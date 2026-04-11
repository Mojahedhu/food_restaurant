import { cn } from "@/lib/utils";
import Container from "./container";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface breadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: breadcrumbProps) => {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("py-2 border-b border-border bg-muted/10", className)}
    >
      <Container>
        <ol className="flex items-center flex-wrap gap-2 text-sm ">
          {/* Home */}
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </li>

          {/* Dynamic Items*/}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "font-medium",
                      isLast ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
};
