const router = require("express").Router();

const {
  testGemini,
} = require("../../services/gemini.service");

router.get("/", async (req, res) => {
  try {
    const response = await testGemini();

    res.json({
      success: true,
      response,
    });
  } catch (err) {
  console.error("FULL ERROR:", err);

  return res.status(500).json({
    success: false,
    message: err.message,
    details: err.response?.data || null,
  });
  }
});

module.exports = router;