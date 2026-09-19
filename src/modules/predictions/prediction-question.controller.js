const supabase = require("../../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

exports.getPredictions = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("subject_id", subjectId)
      .order("probability", {
        ascending: false,
      });

    if (error) throw error;

    return res.json({
      success: true,
      predictions: data || [],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPredictedQuestions = async (
  req,
  res
) => {
  try {
    const { subjectId } = req.params;

    const { data: existingPredictions } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("probability", {
          ascending: false,
        });

    if (
      existingPredictions &&
      existingPredictions.length > 0
    ) {
      return res.json({
        success: true,
        totalPredictions:
          existingPredictions.length,
        predictedQuestions:
          existingPredictions,
      });
    }

    const { data: papers } =
      await supabase
        .from("papers")
        .select("id")
        .eq("subject_id", subjectId);

    const paperIds =
      papers?.map((p) => p.id) || [];

    if (!paperIds.length) {
      return res.status(404).json({
        success: false,
        message:
          "No papers found for subject",
      });
    }

    const { data: questions } =
      await supabase
        .from("questions")
        .select("*")
        .in("paper_id", paperIds);

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message:
          "No analyzed questions found",
      });
    }

    const allQuestions = questions
      .map(
        (q) =>
          `Topic: ${q.topic}
Question: ${q.question_text}
Marks: ${q.marks}`
      )
      .join("\n\n");

    const prompt = `
Predict the 15 most likely exam questions.

${allQuestions}

Return ONLY JSON.

[
 {
  "topic":"Topic Name",
  "question":"Predicted Question",
  "expectedMarks":5,
  "probability":90
 }
]
`;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
      });

    const result =
      await model.generateContent(
        prompt
      );

    let response =
      result.response.text();

    response = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const predictedQuestions =
      JSON.parse(response);

    const predictionRows =
      predictedQuestions.map((q) => ({
        subject_id: subjectId,
        topic: q.topic,
        question: q.question,
        expected_marks:
          q.expectedMarks ||
      q.expected_marks ||
      q.marks ||
      10,
        probability:
          q.probability,
      }));

    await supabase
      .from("predictions")
      .insert(predictionRows);

    return res.json({
      success: true,
      totalPredictions:
        predictedQuestions.length,
      predictedQuestions,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};