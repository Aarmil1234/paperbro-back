const supabase = require("../../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

exports.generatePredictions = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data: papers, error: paperError } =
      await supabase
        .from("papers")
        .select("id")
        .eq("subject_id", subjectId);

    if (paperError) throw paperError;

    if (!papers || papers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No papers found",
      });
    }

    const paperIds = papers.map(
      (p) => p.id
    );

    const {
      data: questions,
      error,
    } = await supabase
      .from("questions")
      .select("*")
      .in("paper_id", paperIds);

    if (error) throw error;

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: "No questions found",
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
You are an expert university professor.

Based on these previous year questions:

${allQuestions}

Predict the 15 most likely questions
that may appear in the next exam.

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

    await supabase
      .from("predictions")
      .delete()
      .eq(
        "subject_id",
        subjectId
      );

    const predictionRows =
      predictedQuestions.map(
        (q) => ({
          subject_id: subjectId,
          topic: q.topic,
          question: q.question,
          expected_marks:
            q.expectedMarks ||
      q.expected_marks ||
      q.marks ||
      5,
          probability:
            q.probability,
        })
      );

    const {
      error: saveError,
    } = await supabase
      .from("predictions")
      .insert(
        predictionRows
      );

    if (saveError)
      throw saveError;

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