import { NextRequest } from "next/server";
import { handlers } from "../../../../../auth"; // Referring to the auth.ts we just created

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  console.log("NextAuth GET Request URL:", req.url);
  console.log("NextAuth GET Search Params:", Object.fromEntries(url.searchParams.entries()));
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  console.log("NextAuth POST Request URL:", req.url);
  return handlers.POST(req);
}

export const dynamic = "force-dynamic";
