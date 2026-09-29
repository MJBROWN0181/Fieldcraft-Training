import { getChatGPTUser, chatGPTSignInPath } from "./chatgpt-auth";
import { redirect } from "next/navigation";
import Workspace from "./workspace";
import { currentRole, getWorkspace, parseJson } from "../db/server";
export const dynamic = "force-dynamic";
export default async function Home({searchParams}:{searchParams:Promise<{invite?:string}>}) {
  const {invite}=await searchParams;
  if (invite && /^[0-9a-f-]{36}$/i.test(invite)) redirect(`/join/${invite}`);
  const user=await getChatGPTUser();
  const role=user ? await currentRole() : null;
  if (role) return <Workspace role={role}/>;
  const saved=await getWorkspace();
  const company=parseJson<{company?:string;logo?:string}>(saved?.data || "{}", {});
  const companyName=company.company?.trim() || "Company training";
  return <main className="entry-page">
    <header className="entry-header"><div className="entry-brand"><span className="entry-mark">{company.logo ? <img src={company.logo} alt={`${companyName} logo`}/> : "F+"}</span><span><strong>{companyName}</strong><small>Fieldcraft Training</small></span></div><span className="entry-pilot">Company training portal</span></header>
    <section className="entry-intro"><p className="entry-kicker">FIELD TRAINING · ONE TEAM</p><h1>Learn the work.<br/>Keep a record of it.</h1><p>Lessons, field questions, company policies, and completed training for {companyName} technicians.</p></section>
    <section className="entry-choices" aria-label="Choose how to enter training">
      <article className="entry-choice"><div className="entry-number">01 / TECHNICIANS</div><h2>Continue your training</h2><p>Open the invitation link your supervisor sent to create your profile and see assigned lessons. If you have opened it on this device before, continue below.</p><a className="entry-button" href="/student">Open my training</a><small>New technician? Use the invitation link from your supervisor first.</small></article>
      <article className="entry-choice"><div className="entry-number">02 / SUPERVISORS &amp; STAFF</div><h2>Manage the training program</h2><p>Create and assign lessons, invite technicians, review their work, and record completed courses.</p>{user ? <p className="entry-access">This signed-in account does not have staff access. Open your staff invitation link, or ask the supervisor who manages this workspace.</p> : <a className="entry-button entry-button-outline" href={chatGPTSignInPath("/")} target="_top">Staff sign in</a>}<small>Managers and trainers use the invitation link from the company owner.</small></article>
    </section><footer className="entry-footer">{companyName} · Training records are available to authorized company staff and invited technicians.</footer>
  </main>;
}
