import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";
import { redirect } from "next/navigation";
import Workspace from "./workspace";
import { currentRole } from "../db/server";
export const dynamic = "force-dynamic";
export default async function Home({searchParams}:{searchParams:Promise<{invite?:string}>}) {
  const {invite}=await searchParams;
  if (invite && /^[0-9a-f-]{36}$/i.test(invite)) redirect(`/join/${invite}`);
  const user=await getChatGPTUser();
  if (!user) return <main style={{maxWidth:600,margin:"80px auto",padding:24,fontFamily:"Arial"}}><h1>Fieldcraft supervisor workspace</h1><p>Supervisors sign in to manage company lessons and technician records.</p><a href={chatGPTSignInPath("/")} target="_top">Sign in as supervisor</a><p>Technicians: open the invitation link your company sent you. You do not need a ChatGPT account.</p></main>;
  const role=await currentRole();
  if (!role) return <main style={{maxWidth:600,margin:"80px auto",padding:24,fontFamily:"Arial"}}><h1>Supervisor access required</h1><p>This account cannot manage this training workspace. Open your staff invitation link to join the training team, or your technician invitation to view lessons.</p></main>;
  return <Workspace role={role}/>;
}
