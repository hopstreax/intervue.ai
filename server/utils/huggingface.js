const axios = require('axios');

/**
 * Sends a conversation history to the Hugging Face Inference API
 * Model: meta-llama/Llama-3.1-8B-Instruct
 */
const generateLlamaResponse = async (messages, systemPrompt) => {
  const hfToken = process.env.HF_TOKEN;
  
  if (!hfToken || hfToken === 'your_token') {
    // Return a mocked response so the user can visibly test the app
    // without needing their HF Token configured yet
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Feedback: Excellent answer, it shows you have a solid grasp of core fundamentals.\nNext Question: What would you consider your most significant achievement in building complex web apps?`);
      }, 2500); // simulate network latency
    });
  }

  const modelUrl = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct/v1/chat/completions';

  // Format payload according to HF Chat Completion API which mirrors OpenAI's structure
  const payload = {
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    max_tokens: 300,
    temperature: 0.7,
    top_p: 0.9,
    stream: false
  };

  try {
    const response = await axios.post(modelUrl, payload, {
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from Hugging Face API');
    }
  } catch (error) {
    if (error.response) {
      console.error('Hugging Face API Error:', error.response.status, error.response.data);
      throw new Error(`HF API Error: ${error.response.data.error || 'Unknown error'}`);
    }
    console.error('Hugging Face Request Failed:', error.message);
    throw error;
  }
};

module.exports = { generateLlamaResponse };
