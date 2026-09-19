const router = require("express").Router();

const {
  generateQuestionAnswer,
} = require("./prediction-answer.controller");

const {
  getPredictedQuestions,
  getPredictions,
} = require("./prediction-question.controller");

const {
  generatePredictions,
} = require("./prediction-generate.controller");

const {
  generateFinalPaper,
} = require("./final-paper.controller");

const {
  getAnswerBook,
} = require("./answer-book.controller");

router.post(
  "/generate/:subjectId",
  generatePredictions
);

router.get(
  "/:subjectId/questions",
  getPredictedQuestions
);

router.get(
  "/:subjectId",
  getPredictions
);

router.get(
  "/:subjectId/final-paper",
  generateFinalPaper
);

router.get(
  "/:subjectId/answer-book",
  getAnswerBook
);

router.post(
  "/generate-answer/:predictionId",
  generateQuestionAnswer
);

module.exports = router;