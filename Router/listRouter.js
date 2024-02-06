const express = require('express');
const router = express.Router();
const pool = require('../db');
const {getLists} = require('../Controllers/listController');
const {createList} = require('../Controllers/listController');
const {getList} = require('../Controllers/listController');
const {deleteList} = require('../Controllers/listController');
const {updateList} = require('../Controllers/listController');
const {verifyToken} = require('../middleware/authenticateToken');




router.route("/api/lists").get(verifyToken, getLists);

router.route("/api/createLists").post(verifyToken, createList);

router.route("/api/getList/:list_id").get(verifyToken, getList);

router.route("/api/deleteList/:list_id").delete(verifyToken, deleteList);

router.route("/api/updateList/:list_id").put(verifyToken, updateList);





module.exports = router;