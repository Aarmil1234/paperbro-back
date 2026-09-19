const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

async function analyzeImage(base64Image) {
  const result = await model.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/png",
      },
    },
    `
Analyze this exam paper.

Extract all questions.

Return ONLY valid JSON.

[
  {
    "question_text": "",
    "marks": 5,
    "topic": ""
  }
]
`,
  ]);

  return result.response.text();
}

module.exports = {
  analyzeImage,
};