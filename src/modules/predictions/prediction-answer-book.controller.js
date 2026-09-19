const PDFDocument = require("pdfkit");
const supabase = require("../../config/supabase");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

exports.generateAnswerBook = async (
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

    if (!predictions || predictions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No predictions found",
      });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PaperBro-AnswerBook.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("PAPERBRO ANSWER BOOK", {
        align: "center",
      });

    doc.moveDown();

    for (let i = 0; i < 1; i++) {
      const prediction = predictions[i];

      const prompt = `
You are an expert university professor.

Generate a complete exam answer.

Topic:
${prediction.topic}

Question:
${prediction.question}

Requirements:
- Detailed answer
- Definitions
- Headings
- Advantages / Disadvantages if applicable
- Tables if applicable
- Exam writing format
- Suitable for ${prediction.expected_marks} marks

Return plain text only.
`;

      const model =
        genAI.getGenerativeModel({
          model: "gemini-3.6-flash",
        });

      const result =
        await model.generateContent(prompt);

      const answer =
        result.response.text();

      doc
        .fontSize(16)
        .text(
          `Question ${i + 1}`
        );

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          prediction.question
        );

      doc.text(
        `Marks: ${prediction.expected_marks}`
      );

      doc.text(
        `Probability: ${prediction.probability}%`
      );

      doc.moveDown();

      doc
        .fontSize(11)
        .text(answer);

      doc.addPage();
    }

    doc.end();

  } catch (err) {
    console.error(
      "ANSWER BOOK ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};