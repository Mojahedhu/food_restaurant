import fs from "fs";
import path from "path";

const type = process.argv[2];
const name = process.argv[3];

if (!type || !name) {
  console.log("Usage: pnpm g [route|page|component] name");
  process.exit(1);
}

const appDir = path.join(process.cwd(), "src/app");
const compDir = path.join(process.cwd(), "src/components");

function write(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

if (type === "route") {
  const base = path.join(appDir, name);

  const files: Record<string, string> = {
    "page.tsx": `export default function Page() {
  return <div>${name} page</div>;
}`,
    "layout.tsx": `export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`,
    "loading.tsx": `export default function Loading() {
  return <p>Loading...</p>;
}`,
    "error.tsx": `"use client";

export default function Error() {
  return <p>Something went wrong</p>;
}`,
    "not-found.tsx": `export default function NotFound() {
  return <p>Page not found</p>;
}`,
    "template.tsx": `export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`,
  };

  for (const [file, content] of Object.entries(files)) {
    write(path.join(base, file), content);
  }

  console.log("Route created:", name);
}

if (type === "page") {
  const file = path.join(appDir, name, "page.tsx");

  write(
    file,
    `export default function Page() {
  return <div>${name}</div>;
}`,
  );

  console.log("Page created:", name);
}

if (type === "component") {
  const file = path.join(compDir, `${name}.tsx`);

  write(
    file,
    `export function ${capitalize(name)}() {
  return <div>${name} component</div>;
}`,
  );

  console.log("Component created:", name);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
