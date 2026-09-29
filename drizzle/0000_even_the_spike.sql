CREATE TABLE `student_profiles` (
	`invite_id` text PRIMARY KEY NOT NULL,
	`profile` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`invite_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`answers` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`techs` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
