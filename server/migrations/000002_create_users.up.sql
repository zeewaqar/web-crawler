CREATE TABLE users (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  email       VARCHAR(255) UNIQUE NOT NULL,
  pass_hash   VARCHAR(60)         NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* seed demo user: admin / admin  (bcrypt hash generated once) */
INSERT INTO users (email, pass_hash)
VALUES ('admin@example.com',
        '$2a$12$wknzD7p2ee7rLBI5I9gvv.zsfBVbboPoY5Of3/SfGmT8k1ekhLJXi');
