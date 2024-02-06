/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS files (
  file_id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  "file" BYTEA NOT NULL,
  task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);