-- reverse: drop the composite and restore the old single-column unique (also prefixing)
ALTER TABLE urls
  DROP INDEX idx_urls_user_url,
  ADD UNIQUE INDEX original_url (original_url(191));
