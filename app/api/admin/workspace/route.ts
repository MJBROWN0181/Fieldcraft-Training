import { NextResponse } from "next/server";
import { database, getWorkspace, currentRole, ownerId, parseJson } from "../../../../db/server";

export const dynamic = "force-dynamic";
export async function GET() {
  const role=await currentRole(); if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const row = await getWorkspace();
    if (!row) return NextResponse.json({ data: null, techs: [], revision: 0, role }, { headers: { "Cache-Control": "no-store" } });
    const profiles = await database().prepare("SELECT profile FROM student_profiles").all<{profile:string}>();
    const progressRows = await database().prepare("SELECT invite_id,lesson_id,answers,updated_at FROM student_progress").all<{invite_id:string;lesson_id:string;answers:string;updated_at:string}>();
    const policyAcks = await database().prepare("SELECT invite_id,policy_id,acknowledged_at FROM policy_acknowledgments").all<{invite_id:string;policy_id:string;acknowledged_at:string}>();
    const workspaceData = parseJson<{removedTechIds?:string[]}>(row.data, {});
    const removed = new Set(workspaceData.removedTechIds || []);
    const techs = parseJson<Array<{id:string}>>(row.techs, []).filter(t => !removed.has(t.id));
    const acceptedInviteIds:string[] = [];
    for (const item of profiles.results) {
      const profile = parseJson<{id:string} | null>(item.profile, null);
      if (profile?.id && !removed.has(profile.id)) { acceptedInviteIds.push(profile.id); const index = techs.findIndex(t => t.id === profile.id); if (index >= 0) techs[index] = profile; else techs.push(profile); }
    }
    return NextResponse.json({ data: parseJson(row.data, null), techs, acceptedInviteIds, policyAcknowledgments:policyAcks.results, progress: progressRows.results.filter(p=>!removed.has(p.invite_id)).map(p=>({techId:p.invite_id,lessonId:p.lesson_id,answers:parseJson(p.answers,[]),updatedAt:p.updated_at})), revision: row.revision, role }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Training records unavailable" }, { status: 503 }); }
}
export async function PUT(request: Request) {
  const role=await currentRole(); if(role!=="owner"&&role!=="trainer")return NextResponse.json({error:"Read-only access"},{status:403});
  try {
    const body = await request.json() as {data?:unknown; techs?:unknown; revision?:number};
    if (!body.data || typeof body.data!=="object" || !Array.isArray(body.techs) || !Number.isInteger(body.revision) || JSON.stringify(body).length > 8_000_000) return NextResponse.json({error:"Invalid record"},{status:400});
    if(role==="trainer"){
      const row=await getWorkspace();if(!row)return NextResponse.json({error:"Company not set up"},{status:403});
      const old=parseJson<Record<string,unknown>>(row.data,{}), next=body.data as Record<string,unknown>;
      for(const key of ["company","logo","primaryTrade","yearsBusiness","services","companyLicenses","serviceAreas","achievements","projects"]){if(JSON.stringify(old[key])!==JSON.stringify(next[key]))return NextResponse.json({error:"Only the owner can change company details"},{status:403});}
    }
    const data = JSON.stringify(body.data), techs = JSON.stringify(body.techs);
    if (body.revision === 0) {
      const inserted = await database().prepare("INSERT OR IGNORE INTO workspace (id,data,techs,revision) VALUES (?,?,?,1)").bind(ownerId,data,techs).run();
      if (inserted.meta.changes) return NextResponse.json({revision:1});
    } else {
      const saved = await database().prepare("UPDATE workspace SET data=?,techs=?,revision=revision+1 WHERE id=? AND revision=?").bind(data,techs,ownerId,body.revision).run();
      if (saved.meta.changes) return NextResponse.json({revision:Number(body.revision)+1});
    }
    return NextResponse.json({error:"Records changed on another device. Reload before saving."},{status:409});
  } catch { return NextResponse.json({error:"Could not save records"},{status:503}); }
}
