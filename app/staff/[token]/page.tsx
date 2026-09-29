import { getChatGPTUser, chatGPTSignInPath } from "../../chatgpt-auth";
import StaffAccept from "./staff-accept";
export const dynamic="force-dynamic";
export default async function StaffInvite({params}:{params:Promise<{token:string}>}){const {token}=await params;const user=await getChatGPTUser();return <main style={{maxWidth:620,margin:"70px auto",padding:24,fontFamily:"Arial"}}><h1>Join the training team</h1>{user?<StaffAccept token={token} email={user.email}/>:<><p>Sign in with your email, then fill out your staff profile to accept this invitation.</p><a href={chatGPTSignInPath(`/staff/${token}`)} target="_top">Sign in to accept</a></>}</main>}
