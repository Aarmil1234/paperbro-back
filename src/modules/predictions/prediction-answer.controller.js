const supabase = require("../../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

const generateQuestionAnswer = async (
  req,
  res
) => {
  try {
    const { predictionId } = req.params;

    const { data: question, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("id", predictionId)
        .single();

    if (error) throw error;

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Already generated
    if (question.answer) {
      return res.json({
        success: true,
        answer: question.answer,
      });
    }

    const prompt = `
You are a GTU University Professor.

Question:
${question.question}

Topic:
${question.topic}

Generate a detailed university exam answer.

Rules:
- Suitable for ${question.expected_marks || 7} marks
- Use headings
- Use bullet points
- Easy language
- Exam-oriented answer
- Return plain text only
`;

   let answer = null;
let retries = 3;

while (retries > 0) {
  try {
    const result =
      await model.generateContent(prompt);

    answer =
      result.response.text();

    break;
  } catch (err) {
    console.log(
      `Gemini Retry Left: ${retries - 1}`
    );

    retries--;

    if (retries === 0) {
      throw err;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );
  }
}

    const { error: updateError } =
      await supabase
        .from("predictions")
        .update({
          answer,
        })
        .eq("id", predictionId);

    if (updateError)
      throw updateError;

    return res.json({
      success: true,
      answer,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  generateQuestionAnswer,
};