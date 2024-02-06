/* Replace with your SQL commands */
ALTER TABLE IF EXISTS tasks
ADD COLUMN user_id INTEGER REFERENCES users (user_id);