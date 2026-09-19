const supabase = require("../../config/supabase");

const {
  analyzePdf,
} = require("../../services/paper-analysis.service");

exports.analyzePaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    // Get paper
    const { data: paper, error } = await supabase
      .from("papers")
      .select("*")
      .eq("id", paperId)
      .single();

    if (error) throw error;

    const pdfUrl =
      `https://slvotxzpbeywkdlpdiup.supabase.co/storage/v1/object/public/papers/${paper.file_url}`;

    // Gemini Response
    let rawText = await analyzePdf(pdfUrl);

    console.log("Gemini Raw Response:");
    console.log(rawText);

    // Remove markdown wrapper
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions;

    try {
      questions = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: "Gemini returned invalid JSON",
        raw: rawText,
      });
    }

    const { data: existingQuestions } = await supabase
  .from("questions")
  .select("id")
  .eq("paper_id", paperId);

  await supabase
  .from("papers")
  .update({
    analyzed: true,
  })
  .eq("id", paperId);

if (existingQuestions && existingQuestions.length > 0) {
 return res.json({
  success: true,
  message: "Paper already analyzed",
  paperId,
  totalQuestions: existingQuestions.length
});
}

    // Save questions
    const questionRows = questions.map((q) => ({
      paper_id: paperId,
      question_text: q.question_text,
      expected_marks: q.expected_marks || null,
      topic: q.topic || null,
    }));

    const {
      data: savedQuestions,
      error: saveError,
    } = await supabase
      .from("questions")
      .insert(questionRows)
      .select();

    if (saveError) throw saveError;

    return res.json({
      success: true,
      totalQuestions: savedQuestions.length,
      questions: savedQuestions,
    });

  } catch (err) {
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
      details: err.response?.data || null,
    });
  }
};