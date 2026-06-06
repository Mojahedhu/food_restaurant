import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based
  token: process.env.SANITY_API_TOKEN, // only if want update content with the client
});

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based
  token: process.env.SANITY_API_TOKEN, // only if want update content with the client
});
