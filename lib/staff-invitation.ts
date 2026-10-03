const SITE_ORIGIN = "https://fieldcraft-training.mjbrown0181.chatgpt.site";
export const STAFF_INVITATION_HEADING = "Join the Training Team at JLBJ";

export function staffInvitationLink(token: string): string {
  return `${SITE_ORIGIN}/staff/${encodeURIComponent(token)}`;
}

export function staffInvitationText(token: string): string {
  // Keep this GSM-safe and within one SMS segment. Names and the longer
  // instructions belong on the invitation page, where they cannot split the URL.
  return `${STAFF_INVITATION_HEADING}\n${staffInvitationLink(token)}`;
}
