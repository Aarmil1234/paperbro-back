const supabase = require("../../config/supabase");
const { analyzePdf } = require("../../services/paper-analysis.service");

exports.uploadPaper = async (req, res) => {
  try {
    const { subjectId, year } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "PDF file required",
      });
    }

    // Upload PDF to Supabase Storage
    const path = require("path");

const ext = path.extname(
  req.file.originalname
);

const safeName =
  req.file.originalname
    .replace(/[^a-zA-Z0-9]/g, "_");

const fileName =
  `${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
      .from("papers")
      .upload(fileName, file.buffer, {
        contentType: "application/pdf",
      });

    if (error) throw error;

    // Save paper record
    const { data: paperRecord, error: dbError } =
      await supabase
        .from("papers")
        .insert([
          {
            subject_id: subjectId,
            year: parseInt(year),
            file_url: data.path,
          },
        ])
        .select()
        .single();

    if (dbError) throw dbError;

    return res.json({
      success: true,
      paper: paperRecord,
      file: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getSubjectAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data: papers } = await supabase
      .from("papers")
      .select("id")
      .eq("subject_id", subjectId);

    const paperIds = papers?.map(
      (p) => p.id
    ) || [];

    const totalPapers =
      paperIds.length;

    let totalQuestions = 0;

    if (paperIds.length) {
      const { count } = await supabase
        .from("questions")
        .select("*", {
          count: "exact",
          head: true,
        })
        .in("paper_id", paperIds);

      totalQuestions = count || 0;
    }

    return res.json({
      success: true,
      totalPapers,
      totalQuestions,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.analyzePaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    const { data: existing } =
      await supabase
        .from("questions")
        .select("id")
        .eq("paper_id", paperId)
        .limit(1);

    if (existing && existing.length > 0) {
      return res.json({
        success: true,
        message: "Paper already analyzed",
        totalQuestions: existing.length,
      });
    }

    return res.json({
      success: true,
      message: "Use Analyze All for now",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPapersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return res.json({
      success: true,
      papers: data,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deletePaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    const { error } = await supabase
      .from("papers")
      .delete()
      .eq("id", paperId);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Paper deleted successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.analyzeAllPapers = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { data: papers, error } =
      await supabase
        .from("papers")
        .select("*")
        .eq("subject_id", subjectId);

    if (error) throw error;

    if (!papers || papers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No papers found",
      });
    }

    let analyzedCount = 0;

    for (const paper of papers) {

      const { data: existing } =
        await supabase
          .from("questions")
          .select("id")
          .eq("paper_id", paper.id)
          .limit(1);

      if (
        existing &&
        existing.length > 0
      ) {
        continue;
      }

      const pdfUrl =
        `https://slvotxzpbeywkdlpdiup.supabase.co/storage/v1/object/public/papers/${paper.file_url}`;

      const aiResponse =
        await analyzePdf(pdfUrl);

      let questions = [];

      try {
        const cleanResponse =
          aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        questions =
          JSON.parse(cleanResponse);

      } catch {
        console.log(
          `Failed parsing paper ${paper.id}`
        );
        continue;
      }

      const questionRows =
        questions.map((q) => ({
          paper_id: paper.id,
          question_text:
            q.question_text,
          expected_marks: q.expected_marks || null,
          topic: q.topic || null,
        }));

      const { error: insertError } =
        await supabase
          .from("questions")
          .insert(questionRows);

      if (insertError) {
        console.log(insertError);
        continue;
      }

      analyzedCount++;
    }

    return res.json({
      success: true,
      analyzedCount,
      totalPapers: papers.length,
      message:
        "All papers analyzed successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
