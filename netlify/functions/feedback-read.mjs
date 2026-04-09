import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url    = new URL(req.url);
  const secret = url.searchParams.get("key");

  // Require the same reset key used for analytics
  if (secret !== "reset-thinking-in-r-2026") {
    return new Response("Forbidden", { status: 403 });
  }

  const store  = getStore("feedback");
  const list   = await store.list();
  const keys   = list.blobs.map((b) => b.key).sort();

  if (!keys.length) {
    return new Response("# Book Feedback\n\nNo feedback yet.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const parts = ["# Book Feedback\n"];
  for (const key of keys) {
    const text = await store.get(key);
    if (text) parts.push(text);
  }

  return new Response(parts.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

export const config = { path: "/api/feedback-read" };
