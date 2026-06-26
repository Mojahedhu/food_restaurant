import { createClient } from "@sanity/client";
import * as fs from "node:fs";
import * as path from "node:path";

// Simple custom loader to parse environment files manually
const loadEnv = (file: string) => {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return; // Skip empty lines and comments
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts
        .join("=")
        .trim()
        .replace(/^['"]|['"]$/g, ""); // Strip wrapping quotes
      process.env[key.trim()] = value;
    });
  }
};

loadEnv(".env");
loadEnv(".env.local");

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Error: Missing Sanity environment variables (Project ID, Dataset, or API Token).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function migrate() {
  console.log("Fetching all openingHours documents...");
  const schedules = await client.fetch(`*[_type == "openingHours"]`);

  console.log(`Found ${schedules.length} schedule templates to migrate.`);

  for (const doc of schedules) {
    if (!doc.schedule || !Array.isArray(doc.schedule)) continue;

    // Map through the array and change openTime to "09:00"
    const updatedSchedule = doc.schedule.map(
      (slot: {
        name: string;
        closeTime: string;
        openTime: string;
        day: string;
      }) => ({
        ...slot,
        openTime: "09:00",
      }),
    );

    console.log(`Updating template "${doc.name}" (${doc._id})...`);

    // Patch the document in Sanity
    await client.patch(doc._id).set({ schedule: updatedSchedule }).commit();
  }

  console.log("Migration completed successfully! 🎉");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
