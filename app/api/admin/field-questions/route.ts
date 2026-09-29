import { NextResponse } from "next/server";
import { database, currentRole } from "../../../../db/server";
import { companyData, loadBoard, unseenCount } from "../../../../db/field-board";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const role=await currentRole();if(!role)return NextResponse.json({error:"Unauthorized"},{status:401});
  try { const data=await companyData(); if (!data?.company) return NextResponse.json({threads:[],unseen:0});
    const unseen=await unseenCount(data.company); if (new URL(request.url).searchParams.has("summary")) return NextResponse.json({unseen},{headers:{"Cache-Control":"no-store"}});
    const q=new URL(request.url).searchParams.get("q")||"";
    const threads=await loadBoard(data.primaryTrade||"Septic",q);
    return NextResponse.json({threads:threads.map(t=>({...t,canDelete:role!=="manager"&&String((t as Record<string,unknown>).company)===data.company})),unseen},{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Questions unavailable"},{status:503}); }
}
export async function POST(request:Request) {
  const role=await currentRole();if(role!=="owner"&&role!=="trainer")return NextResponse.json({error:"Read-only access"},{status:403});
  try { const data=await companyData(); if (!data?.company) return NextResponse.json({error:"Company not set up"},{status:400});
    const input=await request.json() as {action?:string;threadId?:string;subject?:string;body?:string};
    if (input.action==="seen") { await database().prepare("UPDATE field_threads SET admin_seen_at=? WHERE company=? AND admin_seen_at IS NULL").bind(new Date().toISOString(),data.company).run(); return NextResponse.json({saved:true}); }
    if (input.action==="delete") {
      if (!input.threadId) return NextResponse.json({error:"Question not found"},{status:404});
      const thread=await database().prepare("SELECT id FROM field_threads WHERE id=? AND company=?").bind(input.threadId,data.company).first();
      if (!thread) return NextResponse.json({error:"You can only delete questions from your company"},{status:403});
      await database().prepare("DELETE FROM field_replies WHERE thread_id=?").bind(input.threadId).run();
      await database().prepare("DELETE FROM field_threads WHERE id=? AND company=?").bind(input.threadId,data.company).run();
      return NextResponse.json({saved:true});
    }
    const body=String(input.body||"").trim();
    if (input.action==="ask") {
      const subject=String(input.subject||"").trim();
      if (!subject||subject.length>160||!body||body.length>3000) return NextResponse.json({error:"Add a short title and a question under 3,000 characters"},{status:400});
      await database().prepare("INSERT INTO field_threads (id,company,trade,tech_id,author,subject,body,created_at,admin_seen_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),data.company,data.primaryTrade||"Septic","supervisor","Supervisor",subject,body,new Date().toISOString(),new Date().toISOString()).run();
      return NextResponse.json({saved:true});
    }
    if (input.action!=="reply"||!input.threadId||!body||body.length>3000) return NextResponse.json({error:"Write an answer under 3,000 characters"},{status:400});
    const thread=await database().prepare("SELECT id FROM field_threads WHERE id=? AND trade=?").bind(input.threadId,data.primaryTrade||"Septic").first(); if (!thread) return NextResponse.json({error:"Question not found"},{status:404});
    await database().prepare("INSERT INTO field_replies (id,thread_id,author_id,author,role,body,created_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),input.threadId,"supervisor","Supervisor","admin",body,new Date().toISOString()).run();
    return NextResponse.json({saved:true});
  } catch { return NextResponse.json({error:"Could not save answer"},{status:503}); }
}
