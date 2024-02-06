const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//@desc Get Users
//@route GET /registeredUsers
//@access public

const getUsers = async (req, res) => {
  try {
    const conn = await pool.connect();
    const sql = `SELECT * FROM users`;
    const result = await conn.query(sql);
    const rows = result.rows;
    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc Register Account
//@route POST /users
//@access public

const registerAccount = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).send("All fields are mandatory!");
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const conn = await pool.connect();
      const sql = `INSERT INTO users(
                    firstname, lastname, username, email, password)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;`;
      const values = [firstname, lastname, username, email, hashedPassword];
      const result = await conn.query(sql, values);
      const rows = result.rows[0];
      conn.release();
      res.status(201).send(rows);
    }
  } catch (err) {
    res.status(500).send({ err });
  }
};

//@desc Verify Account
//@route POST /users/login
//@access public

const verifyAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).send("All fields are mandatory");
    }
    const conn = await pool.connect();
    const sql = `SELECT * FROM users WHERE username = ($1)`;
    const result = await conn.query(sql, [username]);
    const hashedPassword = result.rows[0].password;
    conn.release();
    if (!(await bcrypt.compare(password, hashedPassword))) {
      return res.status(401).send({ error: "Invalid username or password" });
    }
    let token = jwt.sign({ user: result.rows[0] }, process.env.TOKEN_SECRET, {
      expiresIn: 3600,
    });
    res.status(201).send({ token, message: "You are logged in" });
  } catch (err) {
    res.status(500).send({ err });
  }
};

module.exports = { getUsers, registerAccount, verifyAccount };
