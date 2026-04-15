import { Message } from '../components/ChatArea';
import { Persona } from '../components/Sidebar';

// 1. Chat Proxy — Streams from local backend
export const fetchAIResponse = async (
  prompt: string,
  history: Message[],
  persona: Persona,
  provider: "quantum" | "nexus",
  onStream: (chunk: string) => void
): Promise<string> => {
  const systemMessage = {
    role: 'system',
    content: `You are ${persona.name}, a ${persona.role}. ${persona.description} Your tone is: ${persona.tone}. Stay completely in character and respond to the user as a respectful, highly capable, and dedicated AI maid/assistant.`
  };

  const messages = [
    systemMessage,
    ...history.slice(-15).map((m) => ({
      role: m.role,
      content: m.content
    })),
    { role: 'user', content: prompt }
  ];

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, provider })
    });

    if (!res.ok) throw new Error(`Backend Error: ${res.status}`);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.trim().startsWith('data: '));
      
      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices[0]?.delta?.content || '';
          fullText += token;
          onStream(fullText);
        } catch { }
      }
    }
    return fullText;
  } catch (error) {
    console.error('Proxy Chat Error:', error);
    const fallback = "I'm having trouble connecting to the neural network. Please try again soon!";
    onStream(fallback);
    return fallback;
  }
};

// 2. Vision Proxy — Analyzes image via Google Gemini
export const fetchImageAnalysis = async (file: File, prompt: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', prompt);

  try {
    const res = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.result || "I couldn't analyze the image.";
  } catch (error) {
    console.error('Vision Proxy Error:', error);
    return "Error connecting to vision engine.";
  }
};

// 3. Image Gen Proxy — Text-to-Image via backend
export const fetchImageGeneration = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.imageUrl || '';
  } catch (error) {
    console.error('Image Gen Proxy Error:', error);
    return '';
  }
};
