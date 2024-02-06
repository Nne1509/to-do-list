const express = require("express");
const router = express.Router();
//const upload = require("../middleware/upload");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  searchTask,
  reorderTasks,
  uploadFile,
} = require("../Controllers/taskController");

router.route("/api/lists/:list_id/createTask").post(createTask);

router.route("/api/lists/:list_id/readTasks").get(getTasks);

router.route("/api/lists/:list_id/tasks/:task_id").get(getTask);

router.route("/api/lists/:list_id/tasks/:task_id").put(updateTask);

router.route("/api/lists/:list_id/tasks/:task_id").delete(deleteTask);

router.route("/api/tasks").get(searchTask);

router.route("/api/lists/:list_id/tasks/reorder").patch(reorderTasks);

router
  .route("/api/lists/:list_id/tasks/:task_id/uploads")
  .post(upload.array("files"), uploadFile);

module.exports = router;
