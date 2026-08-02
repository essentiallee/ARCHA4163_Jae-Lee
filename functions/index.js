// Gallery chatbot server
// This follows the tutorial's basic pattern, but keeps the API key private.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-5.6-luna";

// Read the same simple gallery list used by this project.
const thisFolder = dirname(fileURLToPath(import.meta.url));
const galleryCsv = readFileSync(
  join(thisFolder, "data", "gallery-list.csv"),
  "utf8"
);

function galleryListForPrompt() {
  const lines = galleryCsv.trim().split("\n");
  const headings = lines.shift().split(",");

  return lines.map(function (line) {
    const values = line.split(",");
    const row = {};

    headings.forEach(function (heading, index) {
      row[heading] = values[index] || "";
    });

    return `${row.label} | type: ${row.type} | area: ${row.area} | priority: ${row.priority || "none"} | ${row.description}`;
  }).join("\n");
}

export const galleryChat = onRequest(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY]
  },
  async function (request, response) {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Please send a POST request." });
      return;
    }

    const question = String(request.body?.question || "").trim();

    if (!question) {
      response.status(400).json({ error: "Please enter a question." });
      return;
    }

    const messages = [
      {
        role: "system",
        content: `You are a simple gallery assistant for a student project.
Only answer from the gallery list below.
If the list does not contain the answer, say that the information is unavailable.
Keep the response short and clear.

GALLERY LIST
${galleryListForPrompt()}`
      },
      {
        role: "user",
        content: question
      }
    ];

    try {
      const openAIResponse = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY.value()}`
        },
        body: JSON.stringify({ model: MODEL, messages })
      });

      const data = await openAIResponse.json();

      if (!openAIResponse.ok) {
        throw new Error(data.error?.message || "OpenAI request failed.");
      }

      response.json({ answer: data.choices[0].message.content });
    } catch (error) {
      console.error(error);
      response.status(500).json({
        error: "The gallery chatbot is unavailable. Please try again."
      });
    }
  }
);
