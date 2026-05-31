import express from "express";
const router = express.Router();
import { authMiddleware } from "../config/authMiddleware.js";
import { chatWithAI } from "../utils/aiHelper.js";

// 🔧 Helper function for AI calls
const generateAIResponse = async (req, res, prompt, type) => {
  try {
    const result = await chatWithAI(prompt, type);
    if (!result) throw new Error("AI service returned empty response");
    return res.json({ [type]: result });
  } catch (error) {
    console.error(`AI ${type} error:`, error.message);
    return res
      .status(500)
      .json({ error: `Failed to generate ${type}. Please try again later.` });
  }
};

// ✅ Chat endpoint
router.post("/chat", authMiddleware, async (req, res) => {
  const { message, context } = req.body;
  if (!message)
    return res.status(400).json({ error: "Message is required" });

  await generateAIResponse(
    req,
    res,
    `You are an event assistant. Context: ${context || "General"}.
    Message: ${message}`,
    "response"
  );
});

// ✅ Generate event plan
router.post("/generate-plan", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt)
    return res.status(400).json({ error: "Prompt is required" });

  const aiPrompt = `
Generate a detailed event plan for: ${prompt}
Include:
1️⃣ Event Overview (theme, duration, attendees)
2️⃣ Detailed Schedule (day-by-day)
3️⃣ Budget Estimate (venue, food, marketing)
4️⃣ Weather Considerations
5️⃣ Key Highlights

Format clearly with emojis and sections.
`;
  await generateAIResponse(req, res, aiPrompt, "plan");
});

// ✅ Generate Budget
router.post("/generate-budget", authMiddleware, async (req, res) => {
  const { eventType, attendees, duration, location } = req.body;
  if (!eventType || !attendees)
    return res.status(400).json({
      error: "Event type and attendees are required",
    });

  const aiPrompt = `
Create a budget for a ${eventType} with ${attendees} attendees
${duration ? `lasting ${duration} days` : ""} ${location ? `in ${location}` : ""}.
Include cost breakdown, total estimate, and tips. Prices in INR.
`;
  await generateAIResponse(req, res, aiPrompt, "budget");
});

// ✅ Generate Marketing
router.post("/generate-marketing", authMiddleware, async (req, res) => {
  const { eventDetails, contentType } = req.body;
  if (!eventDetails || !contentType)
    return res
      .status(400)
      .json({ error: "Event details and content type are required" });

  let prompt = "";
  switch (contentType) {
    case "social-media":
      prompt = `Create social media posts for ${eventDetails}`;
      break;
    case "email-invite":
      prompt = `Write an email invitation for ${eventDetails}`;
      break;
    case "press-release":
      prompt = `Write a press release for ${eventDetails}`;
      break;
    default:
      prompt = `Generate marketing content for ${eventDetails}`;
  }

  await generateAIResponse(req, res, prompt, "marketing");
});

// ✅ Vendor recommendations
router.post("/generate-vendors", authMiddleware, async (req, res) => {
  const { eventType, location, budget, attendees } = req.body;
  if (!eventType || !location)
    return res
      .status(400)
      .json({ error: "Event type and location are required" });

  const aiPrompt = `
Suggest top vendors for a ${eventType} in ${location}
Budget: ${budget || "flexible"} INR, Attendees: ${attendees || "unknown"}.
Include venue, catering, entertainment, and contacts.
`;
  await generateAIResponse(req, res, aiPrompt, "vendors");
});

// ✅ Timeline
router.post("/generate-timeline", authMiddleware, async (req, res) => {
  const { eventType, duration, startDate } = req.body;
  if (!eventType || !duration)
    return res
      .status(400)
      .json({ error: "Event type and duration are required" });

  const aiPrompt = `
Create a ${duration}-day timeline for ${eventType}
${startDate ? `starting ${startDate}` : ""}.
Include pre-event, during, and post-event tasks.
`;
  await generateAIResponse(req, res, aiPrompt, "timeline");
});

// ✅ Risk Assessment
router.post("/generate-risks", authMiddleware, async (req, res) => {
  const { eventDetails, location, attendees } = req.body;
  if (!eventDetails)
    return res
      .status(400)
      .json({ error: "Event details are required" });

  const aiPrompt = `
Assess risks for ${eventDetails} (${location || "unspecified"}, ${attendees || "N/A"} attendees).
List risks, impact level, and mitigation strategies.
`;
  await generateAIResponse(req, res, aiPrompt, "risks");
});

export default router;
