import { database, getWorkspace, parseJson } from "./server";

type CompanyData = { company?: string; primaryTrade?: string; fieldQuestionsEnabled?: boolean; invites?: Array<{id:string; company:string; trade?:string}>; fixes?: Array<{id:string;trade:string;problem:string;method:string;contributor:string;blocked:boolean}> };
export async function companyData() {
  const row = await getWorkspace();
  return row ? parseJson<CompanyData>(row.data, {}) : null;
}
export async function studentContext(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const data = await companyData();
  const invite = data?.invites?.find(i => i.id === token);
  if (!invite) return null;
  const row = await database().prepare("SELECT profile FROM student_profiles WHERE invite_id=?").bind(token).first<{profile:string}>();
  if (!row) return null;
  const profile = parseJson<{name?:string;trade?:string}>(row.profile, {});
  return { data: data!, invite, profile, trade: profile.trade || invite.trade || "Septic" };
}
export async function loadBoard(trade: string, query = "") {
  const q = query.trim().slice(0, 120);
  const pattern = `%${q}%`;
  const threads = q
    ? await database().prepare("SELECT * FROM field_threads WHERE trade=? AND (subject LIKE ? OR body LIKE ? OR id IN (SELECT thread_id FROM field_replies WHERE body LIKE ?)) ORDER BY created_at DESC LIMIT 100").bind(trade,pattern,pattern,pattern).all()
    : await database().prepare("SELECT * FROM field_threads WHERE trade=? ORDER BY created_at DESC LIMIT 100").bind(trade).all();
  const ids = threads.results.map(r => String(r.id));
  if (!ids.length) return [];
  const replies = await database().prepare(`SELECT * FROM field_replies WHERE thread_id IN (${ids.map(() => "?").join(",")}) ORDER BY created_at ASC`).bind(...ids).all();
  return threads.results.map(t => ({ ...t, replies: replies.results.filter(r => r.thread_id === t.id) }));
}
export async function unseenCount(company: string) {
  const row = await database().prepare("SELECT COUNT(*) AS count FROM field_threads WHERE company=? AND admin_seen_at IS NULL").bind(company).first<{count:number}>();
  return row?.count || 0;
}
