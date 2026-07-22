import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

export const extractTextFromPDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);

  return data.text;
};