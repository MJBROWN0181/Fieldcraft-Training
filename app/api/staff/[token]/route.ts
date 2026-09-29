import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { database } from "../../../../db/server";
export const dynamic="force-dynamic";
type StaffInvite={id:string;email:string;name:string;role:string;expires_at:string;accepted_at:string|null};
async function findInvite(token:string){if(!/^[0-9a-f-]{36}$/i.test(token))return null;return database().prepare("SELECT id,email,name,role,expires_at,accepted_at FROM staff_members WHERE invite_token=?").bind(token).first<StaffInvite>();}
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){const {token}=await params;const row=await findInvite(token);if(!row)return NextResponse.json({error:"Invitation not found"},{status:404});return NextResponse.json({name:row.name,role:row.role,email:row.email,expired:!row.accepted_at&&new Date(row.expires_at).getTime()<Date.now(),accepted:!!row.accepted_at},{headers:{"Cache-Control":"no-store"}});}
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Sign in first"},{status:401});
 const {token}=await params;const row=await findInvite(token);if(!row)return NextResponse.json({error:"Invitation not found"},{status:404});
 const input=await request.json() as {name?:string;email?:string};const name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase();
 if(!name||name.length>120||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Enter your name and a valid email"},{status:400});
 if(email!==user.email.trim().toLowerCase())return NextResponse.json({error:"Use the email of the account you signed in with"},{status:403});
 if(row.email&&row.email!==email)return NextResponse.json({error:`Sign in with ${row.email} to accept this invitation`},{status:403});
 if(row.accepted_at)return NextResponse.json({error:"This invitation has already been accepted"},{status:409});
 if(new Date(row.expires_at).getTime()<Date.now())return NextResponse.json({error:"Invitation expired. Ask the owner for a new link."},{status:410});
 const exists=await database().prepare("SELECT id FROM staff_members WHERE email=? AND accepted_at IS NOT NULL AND id<>?").bind(email,row.id).first();if(exists)return NextResponse.json({error:"This account already has staff access"},{status:409});
 const updated=await database().prepare("UPDATE staff_members SET email=?,name=?,accepted_at=? WHERE id=? AND accepted_at IS NULL AND (email='' OR email=?) AND expires_at>?").bind(email,name,new Date().toISOString(),row.id,email,new Date().toISOString()).run();
 if(!updated.meta.changes)return NextResponse.json({error:"Invitation was already used or expired"},{status:409});
 return NextResponse.json({role:row.role});
}
