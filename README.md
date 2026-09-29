# Fieldcraft Training

Field training workspace for service companies, starting with septic technicians. Supervisors create lessons, invite technicians, assign and schedule lessons, track progress, and record completion. Technicians use invitation links to create profiles and view training without a ChatGPT account.

Live Site: https://fieldcraft-training.mjbrown0181.chatgpt.site

## Current features

- Company branding, profile, and owner-controlled settings
- Technician invitations, profiles, licenses, lesson access, and skill ledger
- Editable slide-style lessons, attachments, field questions, scheduling, and certificates
- Private company policies with file attachments, read acknowledgments, and Policy Talk lessons
- Trade-wide question board with company access toggle and company-specific alerts
- Manager read-only access and trainer access to training tools through invitation links

## Development

Requires Node.js 22.13 or newer and pnpm 11.25. Install dependencies with `pnpm install`, then run `pnpm dev`. Use `pnpm build` and `pnpm lint` for checks. The app runs on vinext and Cloudflare Workers with a D1 database. Schema migrations live in `drizzle/`; generate a migration after schema changes with `pnpm db:generate`.

The live deployment is managed by ChatGPT Sites and uses the D1 binding named `DB` from `.openai/hosting.json`. A local checkout alone does not contain the live company's database or signing identity.

## Current scope

This is an early working version built for one company workspace. It is not a complete multi-company signup system. Trade-board records are organized by trade for future multi-company use. Staff accounts use ChatGPT sign-in, while technicians use their invitation link. The owner email and workspace ID are currently configured in `db/server.ts`; production multi-tenant onboarding will need to replace that single-owner model.

Lesson material and Policy Talks are edited and approved by the supervisor. The ChatGPT drafting action copies a prompt for the supervisor to paste into ChatGPT; it does not send company policy text automatically.
