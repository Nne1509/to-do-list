/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS tasks (
  task_id SERIAL PRIMARY KEY,
  taskname VARCHAR(255) UNIQUE NOT NULL,
  taskdescription VARCHAR(255),
  list_id INTEGER REFERENCES lists(list_id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

