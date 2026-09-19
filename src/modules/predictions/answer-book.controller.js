const supabase = require("../../config/supabase");

exports.getAnswerBook = async (req, res) => {
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
      totalAnswers: data.length,
      answers: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};