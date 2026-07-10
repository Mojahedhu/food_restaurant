---
name: feature-branch-workflow
description: Use this skill for every new feature request in this project. It enforces one branch per feature, and requires the user to commit and push before Claude Code continues to the next feature. This is what makes the CI/CD pipeline meaningful — every push should represent exactly one feature.
---

# Feature Branch Workflow

## Purpose

This project follows a strict **one feature = one branch = one push = one CI run** workflow, integrated through a shared `develop` branch.

## Branch model

- `main` — stable/production. Nothing lands here directly.
- `develop` — integration branch. All features merge here **after CI passes**.
- `feature/<name>` — one per feature, branched off `develop`.

The flow for every feature:

`feature/<name>` → push → **CI runs (lint, type-check, tests, build)** → CI green → **merge into `develop`** → next feature.

CI must run and pass on the feature branch (or its PR into `develop`) before the merge. Never merge a feature into `develop` while CI is red or hasn't run.

The whole point of this tutorial series is to teach GitHub Actions CI/CD properly. That only works if every push to GitHub represents a single, isolated feature. If Claude Code batches multiple features into one branch, or keeps working without stopping for the user to commit, the CI/CD pipeline loses its teaching value — nobody can tell which change broke a test, and pull requests become too large to review.

This file exists to make sure the agent never skips that discipline, even if the user's request casually mentions several features at once.

## Rules Claude Code MUST follow

1. **Check the current branch before starting any new feature.**
   Make sure a `develop` branch exists (create it from `main` if it doesn't). Then, if the current branch is `main` or `develop`, create a new feature branch **off `develop`**, named:
   `feature/<short-feature-name>` (e.g. `feature/task-crud`, `feature/clerk-org-sync`, `feature/plan-limits`).

2. **One feature per branch. No exceptions.**
   Do not combine unrelated features in the same branch, even if it seems more "efficient." If the user's message describes two features, implement only the first one and mention the second is next.

3. **Stop immediately after the feature's code is complete.**
   Do not silently move on to another feature, another prompt, or another item from a list the user gave earlier — even if it seems like the "logical next step."

4. **Explain how to test the feature manually before asking to commit.**
   After the feature's code is complete (and any automated checks pass), give the user clear, concrete steps to verify it **by hand** in the running app — not just "the tests pass." Include:
   - how to get to it (e.g. start the dev server, the exact route/URL, or the command to run),
   - any prerequisite state (signed in, an organization selected, a seeded record, an env var set),
   - what to click or do, and
   - the expected result that means it works.

   Keep it short and specific to what changed. If the feature has no runtime surface a human can see (pure config, types), say so and explain how to confirm it another way.

5. **Ask the user to commit, push, and let CI run before merging to `develop`.**
   Use a message close to this template:

   > "The `<feature name>` feature is ready on branch `feature/<name>`. Here's how to test it manually: <steps>. Once you're happy, commit and push this branch so the CI pipeline can run. When CI is green, merge it into `develop`. Let me know when that's done and I'll continue with the next feature."

6. **Do not create a new branch or start a new feature until the user confirms push + CI + merge to `develop`.**
   Wait for a clear confirmation such as "done", "pushed", "merged", "CI passed", or similar. If the user says something else entirely, ask them directly whether the previous feature was pushed, passed CI, and merged into `develop`.

7. **Never commit or push code yourself.**
   Committing and pushing must always be a manual action by the user. This is intentional — it keeps the user in control of exactly what triggers the CI/CD pipeline, and reinforces the habit of reviewing a diff before pushing it.

8. **If the user explicitly asks to skip this process** for a specific case (e.g. "just keep going, don't wait this time"), follow their instruction, but remind them once that this breaks the one-feature-per-branch rule for that specific change.

## Why this matters

Every push triggers the GitHub Actions workflows (lint, type-check, tests, build, and eventually deploy). If features are batched together in one branch:

- It becomes impossible to tell which change broke the pipeline.
- Pull requests become too large to review properly.
- The CI/CD lessons in this series lose their point — the whole exercise is to see a clean, isolated pipeline run per feature.
