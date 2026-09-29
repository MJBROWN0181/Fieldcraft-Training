import { NextResponse } from "next/server";
import { database } from "../../../../../db/server";
import { loadBoard, studentContext } from "../../../../../db/field-board";
export const dynamic = "force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
  try { const {token}=await params; const context=await studentContext(token); if (!context) return NextResponse.json({error:"Complete your profile first"},{status:403});
    if (context.data.fieldQuestionsEnabled===false) return NextResponse.json({enabled:false,threads:[]},{headers:{"Cache-Control":"no-store"}});
    const q=new URL(request.url).searchParams.get("q")||"";
    return NextResponse.json({enabled:true,threads:await loadBoard(context.trade,q)},{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Questions unavailable"},{status:503}); }
}
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}) {
  try { const {token}=await params; const context=await studentContext(token); if (!context) return NextResponse.json({error:"Complete your profile first"},{status:403});
    if (context.data.fieldQuestionsEnabled===false) return NextResponse.json({error:"Field questions are off for your company"},{status:403});
    const input=await request.json() as {action?:string;subject?:string;body?:string;threadId?:string}; const body=String(input.body||"").trim();
    if (!body||body.length>3000) return NextResponse.json({error:"Write between 1 and 3,000 characters"},{status:400});
    if (input.action==="ask") { const subject=String(input.subject||"").trim(); if (!subject||subject.length>160) return NextResponse.json({error:"Give your question a short title"},{status:400});
      const recent=await database().prepare("SELECT COUNT(*) AS count FROM field_threads WHERE tech_id=? AND created_at>?").bind(token,new Date(Date.now()-60*60*1000).toISOString()).first<{count:number}>();
      if ((recent?.count||0)>=10) return NextResponse.json({error:"Please wait before posting more questions"},{status:429});
      await database().prepare("INSERT INTO field_threads (id,company,trade,tech_id,author,subject,body,created_at,admin_seen_at) VALUES (?,?,?,?,?,?,?,?,NULL)").bind(crypto.randomUUID(),context.invite.company,context.trade,token,context.profile.name||"Technician",subject,body,new Date().toISOString()).run();
    } else if (input.action==="reply") { const thread=await database().prepare("SELECT id FROM field_threads WHERE id=? AND trade=?").bind(input.threadId,context.trade).first(); if (!thread) return NextResponse.json({error:"Question not found"},{status:404});
      await database().prepare("INSERT INTO field_replies (id,thread_id,author_id,author,role,body,created_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),input.threadId,token,context.profile.name||"Technician","technician",body,new Date().toISOString()).run();
    } else return NextResponse.json({error:"Invalid action"},{status:400});
    return NextResponse.json({saved:true});
  } catch { return NextResponse.json({error:"Could not save question"},{status:503}); }
}
