"use client";

import { createClient } from "@sanity/client";

export const liveClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-05-24",

  useCdn: false,
});
