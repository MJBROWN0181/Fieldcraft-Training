CREATE TABLE `staff_members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`invite_token` text NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_staff_email` ON `staff_members` (`email`);--> statement-breakpoint
CREATE INDEX `idx_staff_token` ON `staff_members` (`invite_token`);