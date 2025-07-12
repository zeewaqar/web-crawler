-- 1) drop the old single-column unique index on original_url
ALTER TABLE urls
  DROP INDEX original_url;

-- 2) add the new composite unique index, prefixing original_url to 191 chars
ALTER TABLE urls
  ADD UNIQUE INDEX idx_urls_user_url (user_id, original_url(191));
