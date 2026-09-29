import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";

const OWNER_ID = "28bea16b-6ef6-4fd6-8e73-97db7fae7d8d";
const OWNER_EMAIL = "mjbrown0181@icloud.com";
export function database() {
  if (!env.DB) throw new Error("Training database unavailable");
  return env.DB;
}
export async function isOwner() {
  const user = await getChatGPTUser();
  return user?.email.trim().toLowerCase() === OWNER_EMAIL;
}
export type StaffRole="owner"|"trainer"|"manager";
export async function currentRole():Promise<StaffRole|null> {
  const user=await getChatGPTUser();
  if (!user) return null;
  const email=user.email.trim().toLowerCase();
  if (email===OWNER_EMAIL) return "owner";
  const row=await database().prepare("SELECT role FROM staff_members WHERE email=? AND accepted_at IS NOT NULL").bind(email).first<{role:string}>();
  return row?.role==="trainer"||row?.role==="manager"?row.role:null;
}
export async function getWorkspace() {
  return database().prepare("SELECT data, techs, revision FROM workspace WHERE id = ?").bind(OWNER_ID).first<{data:string; techs:string; revision:number}>();
}
export function parseJson<T>(source: string, fallback: T): T {
  try { return JSON.parse(source) as T; } catch { return fallback; }
}
export const ownerId = OWNER_ID;
