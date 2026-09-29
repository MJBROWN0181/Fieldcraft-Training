CREATE TABLE `field_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_field_replies_thread_created` ON `field_replies` (`thread_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `field_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`trade` text NOT NULL,
	`tech_id` text NOT NULL,
	`author` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`admin_seen_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_field_threads_company_trade_created` ON `field_threads` (`company`,`trade`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_field_threads_tech_created` ON `field_threads` (`tech_id`,`created_at`);