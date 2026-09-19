const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

async function analyzePdf(pdfUrl) {
  // Download PDF
  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
  });

  const pdfBase64 = Buffer.from(
    response.data
  ).toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        data: pdfBase64,
        mimeType: "application/pdf",
      },
    },
    `
You are an exam paper analyzer.

Extract all questions from this exam paper.

For each question return:

{
  "question_text": "...",
  "marks": 5,
  "topic": "Short Specific Topic"
}

Rules:

- Topic must be 2-5 words.
- Different questions should have different topics.
- Do NOT use subject name as topic.
- Use specific concepts.

Examples:

"Explain dog-legged stair"
=> "Stairs"

"Describe Flemish bond"
=> "Brick Masonry"

"Explain strap footing"
=> "Foundations"

"Discuss roof truss"
=> "Roof Trusses"

Return ONLY valid JSON array.
`,
  ]);

  return result.response.text();
}

module.exports = {
  analyzePdf,
};