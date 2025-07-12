ALTER TABLE `urls`
  ADD COLUMN `user_id` BIGINT NOT NULL DEFAULT 1,
  ADD INDEX `idx_urls_user_id` (`user_id`),
  ADD CONSTRAINT `fk_urls_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
