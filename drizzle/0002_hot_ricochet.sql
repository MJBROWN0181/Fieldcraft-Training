CREATE TABLE `policy_acknowledgments` (
	`invite_id` text NOT NULL,
	`policy_id` text NOT NULL,
	`acknowledged_at` text NOT NULL,
	PRIMARY KEY(`invite_id`, `policy_id`)
);
