import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-testing', // Must be in your .env
});

// 🧠 1. Generate Event Description
export const generateEventDescription = async (eventData) => {
  try {
    const prompt = `Generate a compelling event description for: ${eventData.title}
Category: ${eventData.category}
Date: ${new Date(eventData.startDate).toLocaleDateString()}
Location: ${eventData.location?.city || 'TBD'}
Target audience: ${
      eventData.category === 'college'
        ? 'college students'
        : eventData.category === 'professional'
        ? 'professionals'
        : 'general audience'
    }

Please provide:
1. A catchy tagline (max 10 words)
2. A detailed description (100-200 words)
3. 3-5 key highlights or features
Make it engaging and appropriate for the audience.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // ✅ Updated to latest model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("AI Description generation error:", error.message);
    return "⚠️ Error generating event description. Please check API key or try again.";
  }
};

// 🪄 2. Generate Event Name Suggestions
export const generateEventNameSuggestions = async (theme, category) => {
  try {
    const prompt = `Suggest 5 creative and catchy names for a ${category} event with the theme: ${theme}.
Format as a numbered list.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    });

    const text = response.choices?.[0]?.message?.content || "";
    return text.split("\n").filter((item) => item.trim());
  } catch (error) {
    console.error("AI Name suggestions error:", error.message);
    return ["⚠️ Error generating names. Try again later."];
  }
};

// ✅ 3. Generate To-Do List
export const generateTodoList = async (eventData) => {
  try {
    const duration = eventData.startDate && eventData.endDate
      ? `${Math.ceil(
          (new Date(eventData.endDate) - new Date(eventData.startDate)) /
            (1000 * 60 * 60 * 24)
        )} days`
      : "TBD";

    const prompt = `Create a comprehensive to-do list for planning: ${eventData.title}
Event type: ${eventData.category}
Expected attendees: ${eventData.participants?.length || "TBD"}
Duration: ${duration}

Generate:
- Pre-event preparations (1–2 weeks before)
- Day-of tasks
- Post-event follow-up
- Budget considerations
- Marketing and promotion

Format as a bulleted list.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.6,
    });

    return response.choices?.[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("AI Todo list generation error:", error.message);
    return "⚠️ Error generating To-Do list.";
  }
};

// 💬 4. Chat with AI (Assistant)
export const chatWithAI = async (userMessage, context = "") => {
  try {
    // Check if API key is valid (not dummy)
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-dummy')) {
      return "🤖 AI Assistant: Hello! I'm your event planning assistant. To get personalized AI responses, please add your OpenAI API key to the .env file. For now, here's a sample response:\n\n🎉 Event Planning Tip: Start by defining your event goals and target audience. This will guide all your planning decisions!";
    }

    const systemPrompt = `You are an AI Event Planning Assistant.
Help users with:
- Event ideas, checklists, venues, budgets, marketing, and timelines.
Be creative, brief, and practical.
${context ? `Context: ${context}` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content || "No reply.";
  } catch (error) {
    console.error("AI Chat error:", error.message);
    return "⚠️ AI is currently unavailable. Please try again.";
  }
};

// 🎯 5. Personalized Suggestions
export const generatePersonalizedSuggestions = async (userEvents, userPreferences) => {
  try {
    const eventHistory = userEvents.map((e) => ({
      title: e.title,
      category: e.category,
      date: e.startDate,
      success: e.analytics?.engagement > 50 ? "successful" : "average",
    }));

    const prompt = `User Event History:
${JSON.stringify(eventHistory, null, 2)}
Preferences: ${JSON.stringify(userPreferences, null, 2)}

Suggest:
1. Best future time slots
2. Recommended event categories
3. Improvements for next events`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    return response.choices?.[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("AI Personalized suggestions error:", error.message);
    return "⚠️ Could not generate personalized suggestions.";
  }
};
