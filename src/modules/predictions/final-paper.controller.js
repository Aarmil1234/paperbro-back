// final-paper.controller.js

const supabase = require("../../config/supabase");

exports.generateFinalPaper = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data: predictions, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("probability", {
          ascending: false,
        })
        .limit(15);

    if (error) throw error;

    const totalMarks = predictions.reduce(
      (sum, q) =>
        sum + Number(q.expected_marks || 0),
      0
    );

    return res.json({
      success: true,
      totalQuestions: predictions.length,
      totalMarks,
      predictedPaper: predictions,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};