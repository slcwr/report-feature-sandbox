CREATE TABLE `student_notes` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`student_id` varchar(255) NOT NULL,
	`author_id` bigint NOT NULL,
	`body` varchar(1000),
	`status` enum('open','in_progress','done') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_notes_student_id_unique` UNIQUE(`student_id`)
);
