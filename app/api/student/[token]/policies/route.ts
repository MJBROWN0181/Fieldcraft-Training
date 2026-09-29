import { NextResponse } from "next/server";
import { database, getWorkspace, parseJson } from "../../../../../db/server";
export const dynamic="force-dynamic";

export async function POST(request:Request,{params}:{params:Promise<{token:string}>}) {
  try {
    const {token}=await params;
    if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({error:"Profile required"},{status:403});
    const profile=await database().prepare("SELECT invite_id FROM student_profiles WHERE invite_id=?").bind(token).first();
    const row=await getWorkspace();
    if (!profile||!row) return NextResponse.json({error:"Profile required"},{status:403});
    const data=parseJson<{company?:string;invites?:Array<{id:string;company:string}>;policies?:Array<{id:string}>}>(row.data,{});
    if (!data.invites?.some(i=>i.id===token)) return NextResponse.json({error:"Company access required"},{status:403});
    const input=await request.json() as {policyId?:string};
    if (!data.policies?.some(p=>p.id===input.policyId)) return NextResponse.json({error:"Policy not found"},{status:404});
    const acknowledgedAt=new Date().toISOString();
    await database().prepare("INSERT INTO policy_acknowledgments (invite_id,policy_id,acknowledged_at) VALUES (?,?,?) ON CONFLICT(invite_id,policy_id) DO NOTHING").bind(token,input.policyId,acknowledgedAt).run();
    const record=await database().prepare("SELECT acknowledged_at FROM policy_acknowledgments WHERE invite_id=? AND policy_id=?").bind(token,input.policyId).first<{acknowledged_at:string}>();
    return NextResponse.json({policyId:input.policyId,acknowledgedAt:record?.acknowledged_at});
  } catch { return NextResponse.json({error:"Could not save acknowledgment"},{status:503}); }
}
