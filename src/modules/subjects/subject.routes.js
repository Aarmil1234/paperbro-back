const router = require("express").Router();

const {
  createSubject,
  getSubjects,
  deleteSubject,
} = require("./subject.controller");

router.post("/", createSubject);

router.get("/", getSubjects);

router.delete("/:id", deleteSubject);

module.exports = router;