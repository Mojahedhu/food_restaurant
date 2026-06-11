import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React from "react";

function BlogSearchBox() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4 border-l-4 border-primary pl-3">
        Search
      </h3>
      <div className="flex gap-2">
        <input
          className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50"
          placeholder="Search recipes..."
        />
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 size-9">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default BlogSearchBox;
