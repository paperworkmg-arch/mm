import type { Config } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { trackHype } from "../../db/schema.js";

// Starting likes shown on top of real fan hype; Saucy (03) leads as the Fan Fave
const BASE: Record<string, number> = {
  "01": 2184, "02": 3672, "03": 9847, "04": 4318, "05": 1936, "06": 1527, "07": 6203,
};
const TRACKS = new Set(Object.keys(BASE));

export default async (req: Request) => {
  if (req.method === "POST") {
    let track = "";
    try {
      ({ track = "" } = await req.json());
    } catch {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    if (!TRACKS.has(track)) {
      return Response.json({ error: "Unknown track" }, { status: 400 });
    }
    const [row] = await db
      .insert(trackHype)
      .values({ track, count: 1 })
      .onConflictDoUpdate({
        target: trackHype.track,
        set: { count: sql`${trackHype.count} + 1`, updatedAt: sql`now()` },
      })
      .returning();
    return Response.json({ track: row.track, count: BASE[row.track] + row.count });
  }

  const rows = await db.select().from(trackHype);
  const counts: Record<string, number> = {};
  for (const t of TRACKS) counts[t] = BASE[t];
  for (const r of rows) counts[r.track] += r.count;
  return Response.json(counts, { headers: { "Cache-Control": "no-store" } });
};

export const config: Config = {
  path: "/api/hype",
  method: ["GET", "POST"],
};
