In Sanity Studio (sanity.io) you usually cannot export a dataset directly from the Studio UI. Instead, you export it using the Sanity CLI from your project terminal.

Below is the standard way developers export the database.

1️⃣ Install the Sanity CLI (if not installed)

```powershell
npm install -g @sanity/cli -------
```

Then login:

```powershell
sanity login --------
```

2️⃣ Navigate to your Sanity project

Go to the folder that contains your Sanity Studio.

```powershell
cd your-sanity-project --------
```

3️⃣ Export the dataset

Run:

```powershell
sanity dataset export production --------
```

Example with custom file name:

```powershell
sanity dataset export production backup.tar.gz --------
```

This will create a file like:

production.tar.gz

The file contains:

All documents

Images and uploaded files

Hidden system documents

4️⃣ Export a specific dataset

If your dataset is named something else:

```powershell
sanity dataset export development dev-backup.tar.gz --------
```

5️⃣ Import it later (restore database)

```powershell
sanity dataset import backup.tar.gz production --------
```

⚠️ Important

The export does NOT include:

Schema files

Studio configuration

Access control rules

Those live in your Studio code repository, not in the database.

💡 Useful for your workflow

Since you're building Next.js / full-stack apps and working with Sanity + React, exporting datasets is useful when you want to:

Backup your CMS data

Move data from development → production

Clone a project for another client

✅ If you want, I can also show you:

How to export only specific document types (like products/posts)

How to download your Sanity database as JSON

How to automate backups with GitHub Actions

These are very useful for production projects.

How to download your Sanity database as JSON

How to automate backups with GitHub Actions

I’ll show you both clearly because they’re very useful in real production projects (especially since you're building Next.js + Sanity apps).

1️⃣ Download the Sanity Database as JSON

Sanity stores exports as a .tar.gz archive, but inside it is actually NDJSON (newline-delimited JSON).

You can convert it easily to regular JSON.

Step 1 — Export the dataset

Inside your Sanity project:

sanity dataset export production backup.tar.gz

This downloads the dataset.

Step 2 — Extract the archive

Linux / macOS:

tar -xzf backup.tar.gz --------

Windows (PowerShell):

tar -xvf backup.tar.gz --------

You will see something like:

data.ndjson
assets/
Step 3 — Convert NDJSON → JSON

NDJSON = one JSON document per line.

Node.js script

## Create:

convert.js

```js ------------------------------------------------
const fs = require("fs");

const lines = fs.readFileSync("data.ndjson", "utf8").trim().split("\n");

const json = lines.map((line) => JSON.parse(line));

fs.writeFileSync("data.json", JSON.stringify(json, null, 2));

console.log("Converted to data.json");
```

Run:

```powershell
node convert.js
```

Now you get:

data.json

which contains your full Sanity database.

2️⃣ Automate Sanity Backups with GitHub Actions

This is the best practice for production CMS systems.

We will create a daily automatic backup.

Step 1 — Install Sanity CLI locally

In your project:

```powershell
npm install @sanity/cli
```

Step 2 — Generate a Sanity API Token

Go to:

Sanity Manage Dashboard

Create token with permissions:

Editor

Save it.

Step 3 — Add GitHub Secrets

Go to your repository:

Settings → Secrets → Actions

Add:

SANITY_AUTH_TOKEN
SANITY_PROJECT_ID
SANITY_DATASET

Example:

SANITY_DATASET=production
Step 4 — Create GitHub Action

Create file:

.github/workflows/sanity-backup.yml

```yaml
Workflow
name: Sanity Backup

on:
  schedule:
    - cron: "0 2 * * *"  # every day at 2AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Sanity CLI
        run: npm install -g @sanity/cli

      - name: Export dataset
        run: |
          sanity dataset export ${{ secrets.SANITY_DATASET }} backup.tar.gz \
          --project ${{ secrets.SANITY_PROJECT_ID }} \
          --token ${{ secrets.SANITY_AUTH_TOKEN }}

      - name: Upload backup
        uses: actions/upload-artifact@v4
        with:
          name: sanity-backup
          path: backup.tar.gz
```

Step 5 — What happens now

Every day:

GitHub Actions
↓
Exports Sanity dataset
↓
Stores backup as artifact

You can download it anytime from:

GitHub → Actions → Artifacts
3️⃣ Pro Production Backup (Recommended)

Instead of GitHub artifacts, many teams store backups in:

Storage Why
AWS S3 Cheap & reliable
Cloudflare R2 Free tier
Google Cloud Storage scalable
Backblaze B2 very cheap
💡 Senior Developer Tip

Many production teams run two backups:

Daily → GitHub
Weekly → Cloud storage

This protects against:

accidental deletions

dataset corruption

Sanity project removal

🚀 Since you're building a Next.js + Sanity full-stack stack, I can also show you something extremely useful:
🔥 Sanity Production Setup

preview mode

draft vs published content

ISR / caching

image optimization

GROQ performance

schema versioning

These are the things real production apps use.
