CREATE TABLE urls (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  original_url VARCHAR(768) NOT NULL UNIQUE,
  crawl_status        ENUM('queued','running','done','error') DEFAULT 'queued',
  html_version  VARCHAR(16),
  title         VARCHAR(512),
  h1            INT DEFAULT 0,
  h2            INT DEFAULT 0,
  h3            INT DEFAULT 0,
  internal_links INT DEFAULT 0,
  external_links INT DEFAULT 0,
  broken_links   INT DEFAULT 0,
  has_login      BOOL DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE links (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  url_id     BIGINT NOT NULL,
  href       VARCHAR(2048) NOT NULL,
  http_status     SMALLINT NULL,
  is_internal BOOL,
  checked_at TIMESTAMP NULL,
  CONSTRAINT fk_url FOREIGN KEY (url_id)
    REFERENCES urls(id) ON DELETE CASCADE
);
