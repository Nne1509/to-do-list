/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS Lists (
  list_id SERIAL PRIMARY KEY,
  listName VARCHAR(255) UNIQUE NOT NULL,
  listDescription VARCHAR(255),
  user_id INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);