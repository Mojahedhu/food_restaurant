"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface UsersFilterBarProps {
  roles: Array<{ _id: string; name: string }>;
}

export function UsersFilterBar({ roles }: UsersFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const role = searchParams.get("role") || "all";
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search === urlSearch) return;

    const delayDebounce = setTimeout(() => {
      // eslint-disable-next-line react-hooks/immutability
      updateUrlParam("search", search);
    }, 400);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search !== urlSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters = search.trim() !== "" || role !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
        <Select
          value={role}
          onValueChange={(val) => updateUrlParam("role", val)}
        >
          <SelectTrigger className="w-[165px] bg-background">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(roles || []).map((r) => (
              <SelectItem key={r._id} value={r._id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(val) => updateUrlParam("sortBy", val)}
        >
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Join Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="wallet">Wallet Balance</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(val) => updateUrlParam("sortOrder", val)}
        >
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 gap-1 hover:text-destructive"
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
