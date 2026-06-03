CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `music_favorites` (
	`track_id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`persona` text NOT NULL,
	`intent_rules` text NOT NULL,
	`memory_enabled` integer DEFAULT true NOT NULL,
	`ai_base_url` text DEFAULT 'https://api.openai.com/v1' NOT NULL,
	`ai_model` text DEFAULT 'gpt-4o-mini' NOT NULL,
	`ai_stream` integer DEFAULT true NOT NULL,
	`dify_endpoint` text DEFAULT '' NOT NULL,
	`dify_enabled` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicle_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`temp_left` real DEFAULT 24.5 NOT NULL,
	`temp_right` real DEFAULT 24.5 NOT NULL,
	`fan_speed` integer DEFAULT 2 NOT NULL,
	`locked` integer DEFAULT true NOT NULL,
	`drive_mode` text DEFAULT 'comfort' NOT NULL,
	`ac_on` integer DEFAULT true NOT NULL,
	`airflow` text DEFAULT 'face' NOT NULL,
	`recirculate` integer DEFAULT true NOT NULL,
	`seat_heat_left` integer DEFAULT 0 NOT NULL,
	`seat_heat_right` integer DEFAULT 0 NOT NULL,
	`volume` integer DEFAULT 60 NOT NULL
);
