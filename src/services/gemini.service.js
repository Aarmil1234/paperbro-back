const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

async function testGemini() {
  const result = await model.generateContent(
    "Say Hello PaperBro"
  );

  return result.response.text();
}

module.exports = {
  testGemini,
};