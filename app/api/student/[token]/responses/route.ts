import { NextResponse } from "next/server";
import { database, getWorkspace, parseJson } from "../../../../../db/server";
export const dynamic = "force-dynamic";
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}) {
  try { const {token}=await params; if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({error:"Invalid invitation"},{status:404});
    const row=await getWorkspace(); if (!row) return NextResponse.json({error:"Invitation unavailable"},{status:404});
    const data=parseJson<{invites?:Array<{id:string}>;lessonAccess?:Array<{techId:string;lessonId:string;availableAt:string}>;lessons?:Array<{id:string;status:string;questions:string[]}>}>(row.data,{});
    if (!(data.invites||[]).some(i=>i.id===token)) return NextResponse.json({error:"Invitation unavailable"},{status:404});
    const profile=await database().prepare("SELECT invite_id FROM student_profiles WHERE invite_id=?").bind(token).first();
    if (!profile) return NextResponse.json({error:"Complete your profile first"},{status:403});
    const body=await request.json() as {lessonId?:string;answers?:string[]}; const assignment=(data.lessonAccess||[]).find(a=>a.techId===token&&a.lessonId===body.lessonId); const lesson=(data.lessons||[]).find(l=>l.id===body.lessonId);
    if (!assignment||!lesson||!assignment.availableAt||new Date(assignment.availableAt).getTime()>Date.now()) return NextResponse.json({error:"Lesson unavailable"},{status:403});
    if (!Array.isArray(body.answers)||body.answers.length>30||body.answers.some(a=>typeof a!=="string"||a.length>3000)) return NextResponse.json({error:"Invalid answers"},{status:400});
    const id=`${token}:${lesson.id}`; await database().prepare("INSERT INTO student_progress (id,invite_id,lesson_id,answers,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET answers=excluded.answers,updated_at=excluded.updated_at").bind(id,token,lesson.id,JSON.stringify(body.answers),new Date().toISOString()).run();
    return NextResponse.json({saved:true});
  } catch { return NextResponse.json({error:"Could not save answers"},{status:503}); }
}
