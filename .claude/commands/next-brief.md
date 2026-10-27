---
description: Pull the oldest Ready brief from Notion (FS Claude Code Briefs) and build it
---

Build the next Full Signal brief from Notion.

1. Using the Notion connector, query the FS Claude Code Briefs data source (collection://7f3beafb-654c-4ad4-82c0-e83c4ed31b02) for rows where Status = "Ready" and Repo = "fullsignaladvisory.com". Pick the one with the oldest Created time. If $ARGUMENTS names a Brief ID (for example CCB-3), use that row instead.
   - If nothing is Ready, say "No Ready briefs" and stop.
   - Fetch the row page directly by ID and read the full brief. Do not work from a cached query result.
2. Set the row's Status to "In progress".
3. Create a git branch using the row's Branch field (or `ccb-<id>` if it is blank). Never work on main.
4. Do exactly what the brief says, nothing more. Read the skills the brief names (fs-brand, fs-brand-voice) before writing any copy or styling. Copy marked verbatim is pasted verbatim.
5. Push the branch so Vercel builds a preview. Write the preview URL into the row's Preview URL field and set Status to "In review".
6. Report back in a few lines: what was built, the preview URL, and anything in the brief you could not do or had to guess.

Never merge to main. Rachael reviews the preview first. When she says it is approved, merge, then set the row's Status to "Done".
