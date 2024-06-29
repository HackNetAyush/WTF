const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors());

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  console.log(API_KEY);
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [],
  });

  const instructions = " \n Only provide me code, don't explain if I have not mentioned 'explain' ";
  //const instructions = "Please answer this question. Choose the appropriate option if provided.";

  var completeMsg = userInput + instructions;

  const result = await chat.sendMessage(completeMsg);
  const response = result.response;
  return response.text();
}

app.get("/message", async (req, res) => {
  const userInput = req.query.input; // Change to req.body.input if sending input in the request body
  try {
    const chatResponse = await runChat(userInput);
    res.json({ message: chatResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
