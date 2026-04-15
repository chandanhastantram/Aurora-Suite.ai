import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let groq;
try {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} catch (e) {
  console.warn("Groq API Key missing or invalid.");
}

let geminiAI;
try {
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_')) {
      geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (e) {
  console.warn("Gemini API Key missing or invalid.");
}

// Custom Fallback for when API keys are not provided
const fallbackResponse = async (prompt, res) => {
  const chars = `[Simulated Backend]: Received "${prompt}". Please add your actual API keys to server/.env to use real models.`.split('');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  for (let char of chars) {
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: char } }] })}\n\n`);
    await new Promise(r => setTimeout(r, 20));
  }
  res.write('data: [DONE]\n\n');
  res.end();
};

// 1. Chat Endpoint (Multi-Provider)
app.post('/api/chat', async (req, res) => {
  const { messages, model = "llama-3.3-70b-versatile", provider = "quantum" } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (provider === "nexus") {
      if (!geminiAI) {
          return fallbackResponse(messages[messages.length-1].content, res);
      }
      try {
          // Extract system message for systemInstruction if supported
          let systemInstruction = "";
          const contents = messages.filter(m => {
              if (m.role === 'system') {
                  systemInstruction += m.content + " ";
                  return false;
              }
              return true;
          }).map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
          }));

          const config = systemInstruction ? { systemInstruction } : {};
          const modelInstance = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash", ...config });

          const result = await modelInstance.generateContentStream({ contents });
          for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunkText } }] })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          return res.end();
      } catch (error) {
          console.error('Gemini API Error:', error);
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "\n[Error connecting to Gemini backend or invalid key.]" } }] })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
      }
  }

  // Fallback to Groq
  if (!groq) {
      return fallbackResponse(messages[messages.length-1].content, res);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: model,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of chatCompletion) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Groq API Error:', error);
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "\n[Error connecting to Groq backend.]" } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// 2. Image Analysis Endpoint (Gemini Vision)
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
        if (!geminiAI) {
            return res.json({ result: "Simulated Image Vision: This appears to be an interesting picture. Please add GEMINI_API_KEY to test actual analysis." });
        }

        const prompt = req.body.prompt || "Analyze this image in detail.";
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        const base64Image = fileBuffer.toString('base64');
        
        const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        res.json({ result: response.response.text() });
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        res.status(500).json({ error: "Failed to analyze image." });
    }
});

// 3. Image Generation Endpoint (Pollinations/Free AI Fallback)
// As Gemini and Groq standard free APIs do not natively proxy text-to-image easily without Vertex or external keys, we use a free no-auth endpoint for rapid prototyping
app.post('/api/generate-image', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // Using Pollinations.ai for instant free image generation
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000000);
    const width = 1024;
    const height = 1024;
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
    
    res.json({ imageUrl });
});

// 4. API Health Check / Root Endpoint
app.get('/', (req, res) => {
    res.status(200).send(`
        <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc; margin: 0;">
                <div style="text-align: center;">
                    <h1 style="color: #10b981;">Aurora Suite API Server</h1>
                    <p>The backend is actively running and listening for frontend requests.</p>
                </div>
            </body>
        </html>
    `);
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
