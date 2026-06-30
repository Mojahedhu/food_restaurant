import { NextRequest } from "next/server";
import { handlers } from "../../../../../auth"; // Referring to the auth.ts we just created

export async function GET(req: NextRequest) {
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}

export const dynamic = "force-dynamic";
