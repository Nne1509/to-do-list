const pool = require("../db");
const { getUserID } = require("../services/listServices");
const fs = require("fs");

//@desc create tasks
//@route POST /api/lists/:list_id/createTask
//@access private

const createTask = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const { list_id } = req.params;
    const { taskname, taskdescription, completed, deadline, priority } =
      req.body;
    if (
      !taskname ||
      !taskdescription ||
      completed === undefined ||
      !deadline ||
      !priority ||
      (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW")
    ) {
      return res.status(400).send("Please input task fields");
    } else {
      const conn = await pool.connect();
      const sql = `INSERT INTO tasks(
            taskname, taskdescription, list_id, completed, user_id, deadline, priority )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`;
      const values = [
        taskname,
        taskdescription,
        list_id,
        completed,
        user_id,
        deadline,
        priority,
      ];
      const result = await conn.query(sql, values);
      const rows = result.rows[0];
      conn.release();
      return res.send(rows);
    }
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

//@desc get tasks
//@route GET /api/lists/:list_id/readTasks
//@access public
const getTasks = async (req, res) => {
  try {
    const { list_id } = req.params;
    const user_id = getUserID(req);
    const conn = await pool.connect();
    const sql = `SELECT * FROM tasks WHERE list_id = ($1)`;
    const result = await conn.query(sql, [list_id]);
    const rows = result.rows;
    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc get task
//@route GET /api/lists/:list_id/tasks/:task_id
//@access private

const getTask = async (req, res) => {
  try {
    const { list_id, task_id } = req.params;
    const user_id = getUserID(req);
    const conn = await pool.connect();
    const sql = `SELECT * FROM tasks WHERE task_id = ($1)`;
    const result = await conn.query(sql, [task_id]);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (error) {
    res.status(500).send({ error });
  }
};

//@desc update task
//@route PUT /api/lists/:list_id/tasks/:task_id
//@access private

const updateTask = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const task_id = req.params.task_id;
    const { taskname, taskdescription, completed, deadline, priority } =
      req.body;
    if (
      !taskname ||
      !taskdescription ||
      completed === undefined ||
      !deadline ||
      (priority !== undefined &&
        priority !== "HIGH" &&
        priority !== "MEDIUM" &&
        priority !== "LOW")
    ) {
      return res.status(400).send("Please input all task fields");
    }
    const conn = await pool.connect();
    const sql = `UPDATE tasks SET taskname = ($1), taskdescription = ($2), completed = ($3), deadline = ($4), priority = ($5), user_id = ($6) WHERE task_id = ($7)
        RETURNING *;`;
    const values = [
      taskname,
      taskdescription,
      completed,
      deadline,
      priority,
      user_id,
      task_id,
    ];
    const result = await conn.query(sql, values);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (error) {
    res.status(500).send({ error });
  }
};

//@desc delete task
//@route DELETE /api/lists/:list_id/tasks/:task_id
//@access private

const deleteTask = async (req, res) => {
  try {
    const task_id = req.params.task_id;
    const user_id = getUserID(req);
    const conn = await pool.connect();
    const sql = `DELETE FROM tasks WHERE task_id = ($1)
      RETURNING *`;
    const result = await conn.query(sql, [task_id]);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (error) {
    res.status(500).send({ error });
  }
};

//@desc search a task across all lists
//@route GET /api/tasks
//@access private

const searchTask = async (req, res) => {
  try {
    const { taskname } = req.query;
    const user_id = getUserID(req);
    if (!taskname) {
      return res.status(400).send("taskname required!");
    }
    const sql =
      "SELECT * FROM tasks WHERE taskname ILIKE $1 AND user_id = ($2)";
    const values = [`%${taskname}%`, user_id];
    const result = await pool.query(sql, values);
    const rows = result.rows;
    if (!rows) {
      return res.status(404).send("Task not found");
    }
    return res.send(rows);
  } catch (error) {
    res.status(500).send({ error });
  }
};

//@desc reorder tasks in a list
//@route PATCH /api/lists/:list_id/tasks/reorder
//@access private

const reorderTasks = async (req, res) => {
  try {
    const { list_id } = req.params;
    const user_id = getUserID(req);
    const { orderby } = req.body;
    const conn = await pool.connect();
    let sql;
    if (orderby === "taskname") {
      sql = `SELECT * FROM tasks WHERE list_id = $1 ORDER BY taskname`;
    } else if (orderby === "completed") {
      sql = `SELECT * FROM tasks WHERE list_id = $1 ORDER BY completed`;
    } else if (orderby === "deadline") {
      sql = `SELECT * FROM tasks WHERE list_id = $1 ORDER BY deadline`;
    } else {
      return res.status(400).send("Invalid request");
    }
    const values = [list_id];
    const result = await pool.query(sql, values);
    const rows = result.rows;
    conn.release();
    if (!rows) {
      return res.status(404).send("No data found");
    }
    return res.send(rows);
  } catch (error) {
    res.status(500).send({ error });
  }
};

//@desc upload files to a task
//@route POST /api/lists/:list_id/tasks/:task_id/uploads
//@access private
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const uploadFile = async (req, res) => {
  const user_id = getUserID(req);
  const { task_id, list_id } = req.params;

  //connect to database
  const conn = await pool.connect();
  for (const fileitem of req.files) {
    const originalname = fileitem.originalname;
    const file = fs.readFileSync(fileitem.path);
    const sql = `INSERT INTO files(
      filename, "file", task_id)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const values = [originalname, file, task_id];
    const result = await conn.query(sql, values);
    const rows = result.rows[0];
    console.log(rows);
  }
  conn.release();
  res.json({
    message: "Files uploaded successfully",
  });
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  searchTask,
  reorderTasks,
  uploadFile,
};
