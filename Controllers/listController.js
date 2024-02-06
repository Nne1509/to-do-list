const pool = require("../db");
const { getUserID } = require("../services/listServices");

//@desc get lists
//@route GET /api/lists
//@access private

const getLists = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const conn = await pool.connect();
    const sql = `SELECT * FROM lists WHERE user_id = ($1)`;
    const result = await conn.query(sql, [user_id]);
    const rows = result.rows;
    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc create lists
//@route POST /api/createLists
//@access private

const createList = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const { listname, listdescription, tags } = req.body;
    if (!listname || !listdescription || !tags) {
      return res.status(400).send("All fields are mandatory!");
    } else {
      const conn = await pool.connect();
      const sql = `INSERT INTO lists(listname, listdescription, user_id, tags) VALUES ($1, $2, $3, $4)
            RETURNING *;`;
      const values = [listname, listdescription, user_id, tags];
      const result = await conn.query(sql, values);
      const rows = result.rows[0];
      conn.release();
      return res.send(rows);
    }
  } catch (err) {
    return res.status(500).send({ err });
  }
};

//@desc get a specific list
//@route GET /api/getList/:list_id
//@access private

const getList = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const list_id = req.params.list_id;
    const conn = await pool.connect();
    const sql = `SELECT * FROM lists WHERE list_id = ($1)`;
    const result = await conn.query(sql, [list_id]);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc delete list
//@route DELETE /api/deleteList/:list_id
//@access private

const deleteList = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const list_id = req.params.list_id;
    const conn = await pool.connect();
    const sql = `DELETE FROM lists WHERE list_id = ($1)
        RETURNING *;`;
    const result = await conn.query(sql, [list_id]);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc update list
//@route PUT /api/updateList/:list_id
//@access private

const updateList = async (req, res) => {
  try {
    const user_id = getUserID(req);
    const list_id = req.params.list_id;
    const { listname, listdescription, tags } = req.body;
    if (!listname || !listdescription || !tags) {
      return res.send("All fields are mandatory!");
    }
    const conn = await pool.connect();
    const sql = `UPDATE lists SET listname = ($1), listdescription = ($2), user_id = ($3), tags = ($4) WHERE list_id = ($5)
        RETURNING *;`;
    const values = [listname, listdescription, user_id, tags, list_id];
    const result = await conn.query(sql, values);
    const rows = result.rows[0];
    conn.release();
    return res.send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

module.exports = { getLists, createList, getList, deleteList, updateList };
