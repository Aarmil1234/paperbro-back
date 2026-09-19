const supabase = require("../../config/supabase");

exports.getPredictions = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Get all papers of subject
    const {
      data: papers,
      error: paperError,
    } = await supabase
      .from("papers")
      .select("id")
      .eq("subject_id", subjectId);

    if (paperError) throw paperError;

    if (!papers || papers.length === 0) {
      return res.json({
        success: true,
        totalTopics: 0,
        importantTopics: [],
        message: "No papers found for this subject",
      });
    }

    const paperIds = papers.map((p) => p.id);

    // Get all questions
    const {
      data: questions,
      error: questionError,
    } = await supabase
      .from("questions")
      .select("*")
      .in("paper_id", paperIds);

    if (questionError) throw questionError;

    if (!questions || questions.length === 0) {
      return res.json({
        success: true,
        totalTopics: 0,
        importantTopics: [],
        message: "No analyzed questions found",
      });
    }

    const topicStats = {};

    questions.forEach((q) => {
      const topic = q.topic || "Unknown Topic";

      if (!topicStats[topic]) {
        topicStats[topic] = {
          topic,
          frequency: 0,
          totalMarks: 0,
        };
      }

      topicStats[topic].frequency++;
      topicStats[topic].totalMarks += Number(q.marks || 0);
    });

    const predictions = Object.values(topicStats)
      .map((topic) => ({
        ...topic,
        probability: Math.min(
          100,
          Math.round(
            topic.frequency * 20 +
            topic.totalMarks * 2
          )
        ),
      }))
      .sort(
        (a, b) =>
          b.probability - a.probability
      );

    return res.json({
      success: true,
      totalTopics: predictions.length,
      importantTopics: predictions.slice(0, 20),
    });

  } catch (err) {
    console.error("Prediction Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("probability", {
          ascending: false,
        });

    if (error) throw error;

    return res.json({
      success: true,
      importantTopics: data,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};