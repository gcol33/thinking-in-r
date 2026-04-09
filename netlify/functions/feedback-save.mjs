import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const store = getStore("feedback");
  const now = new Date().toISOString();
  const key = `feedback-${now.replace(/[:.]/g, "-")}`;

  const page     = (data.page || "").replace(/^\//, "").replace(/\.html$/, "") || "unknown";
  const changes  = data.changes  || [];
  const comments = data.comments || [];

  if (!changes.length && !comments.length) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const lines = [`## ${page}  (${now.slice(0, 16).replace("T", " ")})\n`];

  for (const c of changes) {
    const orig = (c.original || "").trim();
    const edit = (c.edited   || "").trim();
    if (orig !== edit) {
      lines.push(`\n**EDIT**`);
      lines.push(`- Original: ${orig}`);
      lines.push(`- Revised:  ${edit}\n`);
    }
  }

  for (const c of comments) {
    const anchor = (c.anchor || "").trim();
    const note   = (c.note   || "").trim();
    lines.push(`\n**COMMENT** on "${anchor.slice(0, 120)}"`);
    lines.push(`${note}\n`);
  }

  lines.push("---\n");

  await store.set(key, lines.join("\n"));

  return new Response(JSON.stringify({ ok: true, key }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/feedback-save" };
