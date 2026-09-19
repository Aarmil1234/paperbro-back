const router =
  require("express").Router();

const {
  analyzePaper,
} = require(
  "./paper-analysis.controller"
);

router.post(
  "/:paperId",
  analyzePaper
);

module.exports = router;