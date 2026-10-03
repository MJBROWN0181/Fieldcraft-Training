import { getChatGPTUser, chatGPTSignInPath } from "../../chatgpt-auth";
import StaffAccept from "./staff-accept";
import { STAFF_INVITATION_HEADING } from "../../../lib/staff-invitation";
export const metadata = { title: STAFF_INVITATION_HEADING };
export const dynamic = "force-dynamic";

export default async function StaffInvite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getChatGPTUser();

  return (
    <main className="staff-invite-page">
      <section className="staff-invite-card" aria-labelledby="staff-invite-title">
        <p className="eyebrow">JLBJ · Fieldcraft Training</p>
        <h1 id="staff-invite-title">Join the training team</h1>
        {user ? (
          <StaffAccept token={token} email={user.email} />
        ) : (
          <>
            <p>Tap the button below to sign in and accept your staff invitation.</p>
            <a
              className="staff-invite-signin"
              href={chatGPTSignInPath(`/staff/${token}`)}
              target="_top"
            >
              Sign in to accept invitation
              <span aria-hidden="true">→</span>
            </a>
            <p className="staff-invite-help">
              The next screen opens ChatGPT sign-in, where you can use your email
              or create an account. Then you’ll return here to complete your staff profile.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
