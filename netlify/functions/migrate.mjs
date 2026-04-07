import { getStore } from "@netlify/blobs";

// One-shot migration: fold legacy `page:<path>` keys into the new
// `page:/thinking-in-r<path>` namespace after the book moved from the
// thinking-in-r.gillescolling.com subdomain to the gillescolling.com/thinking-in-r/
// subpath. All other counters (total, daily, monthly, unique, duration)
// are path-agnostic and don't need migration.
//
// Usage:
//   /api/migrate?key=migrate-thinking-in-r-2026          (dry-run, default)
//   /api/migrate?key=migrate-thinking-in-r-2026&apply=1  (perform migration)

const SECRET = "migrate-thinking-in-r-2026";
const PREFIX = "/thinking-in-r";

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== SECRET) {
    return new Response("unauthorized", { status: 401 });
  }
  const apply = url.searchParams.get("apply") === "1";

  const store = getStore("analytics");
  const { blobs } = await store.list();

  const p = (v) => parseInt(v || "0", 10);
  const plan = [];

  for (const blob of blobs) {
    const key = blob.key;

    // Match `page:<path>` and `owner:page:<path>`
    let ownerPrefix = "";
    let rest = key;
    if (rest.startsWith("owner:")) {
      ownerPrefix = "owner:";
      rest = rest.slice("owner:".length);
    }
    if (!rest.startsWith("page:")) continue;

    const path = rest.slice("page:".length);

    // Already migrated — skip
    if (path === PREFIX || path.startsWith(PREFIX + "/")) continue;

    // Build new key. Old paths always start with "/" (e.g. "/", "/index.html",
    // "/chapters/foreword.html"). The new path is `/thinking-in-r` + old path,
    // which gives "/thinking-in-r/", "/thinking-in-r/index.html", etc.
    const newPath = path === "/" ? PREFIX + "/" : PREFIX + path;
    const oldKey = key;
    const newKey = `${ownerPrefix}page:${newPath}`;

    const oldVal = p(await store.get(oldKey));
    const existingNewVal = p(await store.get(newKey));
    const mergedVal = oldVal + existingNewVal;

    plan.push({
      oldKey,
      newKey,
      oldVal,
      existingNewVal,
      mergedVal,
    });

    if (apply) {
      await store.set(newKey, mergedVal.toString());
      await store.delete(oldKey);
    }
  }

  return Response.json({
    mode: apply ? "applied" : "dry-run",
    migrated: plan.length,
    plan,
  });
};

export const config = { path: "/api/migrate" };
