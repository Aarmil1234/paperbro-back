const { fromBuffer } = require("pdf2pic");
const Tesseract = require("tesseract.js");

async function extractTextFromPdf(pdfBuffer) {
  try {
    console.log("Starting PDF → Image conversion...");

    const convert = fromBuffer(pdfBuffer, {
      density: 300,
      format: "png",
      width: 2000,
      height: 2000,
    });

    const page = await convert(1, {
      responseType: "base64",
    });

    console.log("PDF converted successfully.");

    console.log("Starting OCR...");

    const result = await Tesseract.recognize(
      Buffer.from(page.base64, "base64"),
      "eng"
    );

    console.log("OCR completed.");

    return result.data.text;

  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

module.exports = {
  extractTextFromPdf,
};