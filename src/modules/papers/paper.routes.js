const router =
  require("express").Router();

const paperController =
  require("./paper.controller");

const upload =
  require("../../middleware/upload");

router.post(
  "/upload",
  upload.single("paper"),
  paperController.uploadPaper
);

router.get(
  "/subject/:subjectId",
  paperController.getPapersBySubject
);

router.delete(
  "/:paperId",
  paperController.deletePaper
);

router.get(
  "/analyze/:paperId",
  paperController.analyzePaper
);

router.get(
  "/analyze-all/:subjectId",
  paperController.analyzeAllPapers
);

router.get(
  "/subject/:subjectId/analytics",
  paperController.getSubjectAnalytics
);

module.exports = router;