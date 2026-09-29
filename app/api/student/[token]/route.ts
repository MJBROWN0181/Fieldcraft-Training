import { NextResponse } from "next/server";
import { database, getWorkspace, parseJson } from "../../../../db/server";
export const dynamic = "force-dynamic";
type Invite = {id:string;name:string;phone:string;email:string;title:string;company:string;trade?:string;expiresAt?:string};
type Profile = {id:string;name:string;phone:string;email:string;company:string;trade:string;address?:string;years?:string;background?:string;licenses?:Array<{name:string;number:string;expires:string}>};
async function lookup(token:string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const row = await getWorkspace(); if (!row) return null;
  const data = parseJson<{company?:string;invites?:Invite[];lessons?:Array<Record<string,unknown>>;policies?:Array<{id:string;title:string;body:string;attachments?:Array<{id:string;name:string;mime:string;data:string}>}>;lessonAccess?:Array<{techId:string;lessonId:string;availableAt:string}>;fieldQuestionsEnabled?:boolean;completions?:Array<{techId:string;courseName:string;companyName:string;completedDate:string;signedDate:string}>}>(row.data,{});
  const invite = (data.invites || []).find(i => i.id === token);
  return invite ? {data,invite} : null;
}
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}) {
  try { const {token}=await params; const found=await lookup(token); if (!found) return NextResponse.json({error:"Invitation not found"},{status:404});
    const saved = await database().prepare("SELECT profile FROM student_profiles WHERE invite_id=?").bind(token).first<{profile:string}>();
    const profile = saved ? parseJson<Profile|null>(saved.profile,null) : null;
    if (!profile && (!found.invite.expiresAt || new Date(found.invite.expiresAt).getTime() <= Date.now())) return NextResponse.json({error:"This invitation expired. Ask your supervisor to resend it."},{status:410});
    const lessons = profile ? (found.data.lessonAccess || []).filter(a=>a.techId===token).map(a=>{
      const lesson=(found.data.lessons || []).find(l=>l.id===a.lessonId);
      if (!lesson) return null;
      const available=!!a.availableAt && new Date(a.availableAt).getTime()<=Date.now();
      return {id:lesson.id,title:lesson.title,trade:lesson.trade,summary:lesson.summary,duration:lesson.duration,availableAt:a.availableAt,available,
        ...(available ? {slides:lesson.slides,content:lesson.content,questions:lesson.questions,modes:lesson.modes,attachments:lesson.attachments} : {})};
    }).filter(Boolean) : [];
    const acknowledgments=profile ? await database().prepare("SELECT policy_id,acknowledged_at FROM policy_acknowledgments WHERE invite_id=?").bind(token).all<{policy_id:string;acknowledged_at:string}>() : {results:[]};
    return NextResponse.json({invite:found.invite,profile,lessons,policies:profile?(found.data.policies||[]):[],policyAcknowledgments:acknowledgments.results,fieldQuestionsEnabled:found.data.fieldQuestionsEnabled!==false,completions:(found.data.completions||[]).filter(c=>c.techId===token)},{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Training records unavailable"},{status:503}); }
}
export async function PUT(request:Request,{params}:{params:Promise<{token:string}>}) {
  try { const {token}=await params; const found=await lookup(token); if (!found) return NextResponse.json({error:"Invitation not found"},{status:404});
    const existing = await database().prepare("SELECT invite_id FROM student_profiles WHERE invite_id=?").bind(token).first();
    if (!existing && (!found.invite.expiresAt || new Date(found.invite.expiresAt).getTime() <= Date.now())) return NextResponse.json({error:"This invitation expired. Ask your supervisor to resend it."},{status:410});
    const input=await request.json() as Partial<Profile>; const name=String(input.name||"").trim(),email=String(input.email||"").trim(),phone=String(input.phone||"").trim();
    if (!name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || JSON.stringify(input).length>15000) return NextResponse.json({error:"Name, valid email, and phone are required"},{status:400});
    const profile:Profile={id:token,name,email,phone,company:found.invite.company,trade:found.invite.trade||"Septic",address:String(input.address||"").slice(0,300),years:String(input.years||"").slice(0,3),background:String(input.background||"").slice(0,5000),licenses:Array.isArray(input.licenses)?input.licenses.slice(0,20).map(l=>({name:String(l.name||"").slice(0,120),number:String(l.number||"").slice(0,120),expires:String(l.expires||"").slice(0,30)})):[]};
    await database().prepare("INSERT INTO student_profiles (invite_id,profile,updated_at) VALUES (?,?,?) ON CONFLICT(invite_id) DO UPDATE SET profile=excluded.profile,updated_at=excluded.updated_at").bind(token,JSON.stringify(profile),new Date().toISOString()).run();
    return NextResponse.json({profile});
  } catch { return NextResponse.json({error:"Could not save profile"},{status:503}); }
}
