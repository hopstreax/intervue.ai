/**
 * Unified AI Router
 * 
 * Selects the correct AI engine (Gemini or OpenAI GPT) based on the
 * model parameter. All controllers import from this module instead
 * of importing directly from gemini.js or openai.js.
 */

const { parseResumeWithGemini, generateGeminiChatResponse, evaluateInterviewWithGemini } = require('./gemini');
const { parseResumeWithOpenAI, generateOpenAIChatResponse, evaluateInterviewWithOpenAI } = require('./openai');

/**
 * Returns the AI engine functions for the specified model.
 * @param {'gemini' | 'gpt'} model - The AI model to use.
 */
const getEngine = (model = 'gemini') => {
  if (model === 'gpt') {
    return {
      name: 'GPT-4o-mini',
      parseResume: parseResumeWithOpenAI,
      generateChatResponse: generateOpenAIChatResponse,
      evaluateInterview: evaluateInterviewWithOpenAI,
    };
  }
  return {
    name: 'Gemini 1.5 Flash',
    parseResume: parseResumeWithGemini,
    generateChatResponse: generateGeminiChatResponse,
    evaluateInterview: evaluateInterviewWithGemini,
  };
};

module.exports = { getEngine };
