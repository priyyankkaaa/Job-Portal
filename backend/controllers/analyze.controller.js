import download from "download";
import path from "path";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { callGemini } from "../services/gemini.service.js";
import { cleanGeminiResponse } from "../utils/responseValidator.js";

const analyzeResume = async (req, res) => {
  try {
    const userId = req.id;
    const { jobId } = req.params;
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!user.profile.resume) {
      return res.status(400).json({
        success: false,
        message: "Resume not uploaded",
      });
    }
    const pdfPath = path.join(process.cwd(), "resume.pdf");
    await download(user.profile.resume, process.cwd(), {
      filename: "resume.pdf",
    });
    const resumeText = await extractTextFromPDF(pdfPath);
   //prompt
   const prompt = `
        You are an expert ATS Resume Analyzer.

        Analyze the resume against the job description.

        Job Title:
        ${job.title}

        Job Description:
        ${job.description}

        Required Skills:
        ${job.requirements.join(", ")}

        Resume:
        ${resumeText}

        Return ONLY valid JSON in this format:

        {
          "matchScore": 0,
          "summary": "",
          "matchingSkills": [],
          "missingSkills": [],
          "strengths": [],
          "weaknesses": [],
          "suggestions": [],
          "interviewTopics": []
        }
        `;


     const geminiResponse = await callGemini(prompt);
    const analysis = cleanGeminiResponse(geminiResponse);
    console.log(analysis);
    return res.status(200).json({
    success: true,
    analysis,
   });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
            error.status === 503
                ? "AI service is busy. Please try again in a few moments."
                : "Failed to analyze resume.",
    });
  }
};

export { analyzeResume };