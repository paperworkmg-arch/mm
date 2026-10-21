import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { subscribers } from "../../db/schema.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async (req: Request) => {
  let email = "";
  try {
    ({ email = "" } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  email = String(email).trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ error: "That email doesn't look right" }, { status: 400 });
  }

  await db.insert(subscribers).values({ email }).onConflictDoNothing();
  return Response.json({ ok: true }, { status: 201 });
};

export const config: Config = {
  path: "/api/signup",
  method: "POST",
};
