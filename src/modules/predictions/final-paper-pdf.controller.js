const PDFDocument = require("pdfkit");
const supabase = require("../../config/supabase");

exports.generateFinalPaperPdf = async (
  req,
  res
) => {
  try {
    const { subjectId } = req.params;

    const { data: predictions, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("probability", {
          ascending: false,
        });

    if (error) throw error;

    if (!predictions.length) {
      return res.status(404).json({
        success: false,
        message:
          "No predictions found",
      });
    }

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PredictedPaper.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text("PAPERBRO PREDICTED PAPER", {
        align: "center",
      });

    doc.moveDown();

    let totalMarks = 0;

    predictions.forEach(
      (question, index) => {
        totalMarks +=
          question.expected_marks || 0;

        doc
          .fontSize(12)
          .text(
            `Q${index + 1}. ${
              question.question
            }`
          );

        doc.text(
          `Marks: ${question.expected_marks}`
        );

        doc.text(
          `Probability: ${question.probability}%`
        );

        doc.moveDown();
      }
    );

    doc.moveDown();

    doc.text(
      `Total Marks: ${totalMarks}`
    );

    doc.end();

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};