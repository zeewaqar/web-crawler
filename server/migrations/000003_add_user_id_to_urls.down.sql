ALTER TABLE `urls`
  DROP FOREIGN KEY `fk_urls_user`,
  DROP INDEX `idx_urls_user_id`,
  DROP COLUMN `user_id`;
