const axios = require('axios');

/**
 * Helper to check if OpenAI key is set.
 */
const hasOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here' && key.trim() !== '';
};

/**
 * Call the OpenAI Chat Completions API (gpt-4o-mini).
 */
const callOpenAI = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0 &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response structure from OpenAI API');
    }
  } catch (error) {
    if (error.response) {
      console.error('[OpenAI API Error]', error.response.status, error.response.data);
      throw new Error(`OpenAI API Error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    console.error('[OpenAI Request Failed]', error.message);
    throw error;
  }
};

/**
 * 1. Parse a resume and extract skills, projects, internships/experience.
 */
const parseResumeWithOpenAI = async (rawText) => {
  if (!hasOpenAIKey()) {
    console.log('[OpenAI] API Key not set. Falling back to mock extraction.');
    return {
      education: 'B.S. in Computer Science',
      skills: 'JavaScript, React.js, Node.js, Express, MongoDB, Git, HTML, CSS, REST APIs',
      projects: '• Portfolio Website: Built using React & CSS\n• Tasks App: Created REST APIs in Express',
      internships: '• Software Engineering Intern at Tech Corp (6 Months): Worked on full-stack React applications.',
      extracurriculars: '• Hackathon Participant\n• Open Source Contributor'
    };
  }

  const prompt = `
You are an expert AI resume parser. Analyze the following raw text extracted from a resume and extract the key sections: Education, Skills, Projects, and Work Experience/Internships.
You MUST format your output strictly as a JSON object, with no other text, markdown blocks, or commentary. Use this exact structure:
{
  "education": "Concise summary of education details",
  "skills": "Comma-separated list of technical skills and soft skills",
  "projects": "Bullet-point summary of key projects",
  "internships": "Bullet-point summary of work experience, internships, or employment details",
  "extracurriculars": "Bullet-point summary of achievements, certifications, or extracurriculars"
}

Raw Resume Text:
${rawText}
  `.trim();

  try {
    const rawResult = await callOpenAI(prompt);
    const sanitized = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(sanitized);
  } catch (err) {
    console.error('[OpenAI Parser Failed, falling back]', err.message);
    return {
      education: 'B.S. in Computer Science',
      skills: 'JavaScript, React, Node.js, Express, MongoDB',
      projects: '• E-Commerce Web App: React and Stripe integration\n• Chat App: Node.js and Socket.io',
      internships: '• Junior Developer: Fullstack application developer',
      extracurriculars: '• Certified AWS Developer'
    };
  }
};

/**
 * 2. Generate a chatbot interview response (feedback + next question).
 */
const generateOpenAIChatResponse = async (messages, systemPrompt) => {
  if (!hasOpenAIKey()) {
    console.log('[OpenAI] API Key not set. Simulating AI interviewer response.');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Feedback: Excellent answer! It shows a deep understanding of core development principles.
Next Question: Can you explain how you would design and optimize database queries for large datasets in MongoDB?`);
      }, 1500);
    });
  }

  const conversation = messages
    .map((m) => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
    .join('\n');

  const prompt = `
Review the conversation transcript between the candidate and the interviewer:
${conversation}

Respond strictly in the following format:
Feedback: [Your 1-2 sentence feedback on their last answer]
Next Question: [Your single next interview question]
  `.trim();

  try {
    return await callOpenAI(prompt, systemPrompt);
  } catch (err) {
    console.error('[OpenAI Chat failed, falling back]', err.message);
    return `Feedback: Interesting explanation.
Next Question: How do you handle React component re-rendering and performance profiling?`;
  }
};

/**
 * 3. Evaluate the completed interview transcript.
 */
const evaluateInterviewWithOpenAI = async (messages, targetRole = 'Software Engineer') => {
  if (!hasOpenAIKey()) {
    console.log('[OpenAI] API Key not set. Simulating final performance analysis.');
    return {
      overallScore: 82,
      technicalDepth: 88,
      communication: 76,
      problemSolving: 82,
      confidence: 70,
      explanation: 85,
      strengths: [
        'Clear understanding of frontend state management and lifecycle hooks.',
        'Good demonstration of microservice communication paradigms.',
        'Practical knowledge of document database designs (indexing and referencing).'
      ],
      weaknesses: [
        'Lacks depth in explaining security headers and JWT session revocation strategies.',
        'Struggled to articulate memory management optimizations under high server load.'
      ],
      studyTopics: [
        { icon: 'security', title: 'JWT Authentication', sub: 'Refresh tokens, rotation, and revocation structures', priority: 'High' },
        { icon: 'api', title: 'OAuth2 Integration', sub: 'OAuth grant types, state tokens, and CSRF protection', priority: 'Medium' },
        { icon: 'storage', title: 'MongoDB Indexing', sub: 'Compound keys, partial index filters, and execution plans', priority: 'High' }
      ],
      roadmap: [
        { day: 'MONDAY', priority: 'High Priority', title: 'MongoDB Indexing & Explain Plans', desc: 'Perform execution profiling, create compound indexes, and analyze performance differences.' },
        { day: 'TUESDAY', priority: 'Medium Priority', title: 'JWT Refresh Rotation Protocols', desc: 'Implement token revocation lists, refresh token rotation, and cookie storage policies.' },
        { day: 'WEDNESDAY', priority: 'Low Priority', title: 'React Hooks Tuning & profiling', desc: 'Deep dive into rendering lifecycles, useCallback caching boundaries, and concurrent rendering.' }
      ],
      aiFeedback: 'Overall strong performance. Technical depth in MongoDB and React is evident. Standard security protocols and lifecycle memory management need closer study.'
    };
  }

  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
    .join('\n');

  const prompt = `
Analyze the following technical interview transcript for a target role of: "${targetRole}".
Generate a detailed evaluation scoring their performance.
You MUST format your output strictly as a JSON object, with no other text, markdown blocks, or commentary. Use this exact structure:
{
  "overallScore": 82,
  "technicalDepth": 88,
  "communication": 76,
  "problemSolving": 82,
  "confidence": 70,
  "explanation": 85,
  "strengths": [
    "strength point 1",
    "strength point 2",
    "strength point 3"
  ],
  "weaknesses": [
    "weakness point 1",
    "weakness point 2"
  ],
  "studyTopics": [
    { "icon": "security", "title": "Topic name", "sub": "Short description of focus area", "priority": "High" },
    { "icon": "api", "title": "Topic name", "sub": "Short description of focus area", "priority": "Medium" },
    { "icon": "storage", "title": "Topic name", "sub": "Short description of focus area", "priority": "High" }
  ],
  "roadmap": [
    { "day": "MONDAY", "title": "Focus Day Goal", "desc": "Detailed study activities description" },
    { "day": "TUESDAY", "title": "Focus Day Goal", "desc": "Detailed study activities description" },
    { "day": "WEDNESDAY", "title": "Focus Day Goal", "desc": "Detailed study activities description" }
  ],
  "aiFeedback": "An overall detailed summary feedback paragraph summarizing the candidate performance and key shortcomings."
}

Interview Transcript:
${transcript}
  `.trim();

  try {
    const rawResult = await callOpenAI(prompt);
    const sanitized = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(sanitized);
  } catch (err) {
    console.error('[OpenAI Evaluation failed, returning standard structure]', err.message);
    return {
      overallScore: 78,
      technicalDepth: 80,
      communication: 75,
      problemSolving: 80,
      confidence: 75,
      explanation: 80,
      strengths: ['Demonstrated clear answers.', 'Solid coding foundations.'],
      weaknesses: ['Could improve system design detailing.'],
      studyTopics: [{ icon: 'security', title: 'System Security', sub: 'Learn API security details', priority: 'Medium' }],
      roadmap: [{ day: 'MONDAY', title: 'Security protocols', desc: 'Read security docs' }],
      aiFeedback: 'Good effort. Solid programming fundamentals. Needs preparation on backend optimization.'
    };
  }
};

module.exports = {
  parseResumeWithOpenAI,
  generateOpenAIChatResponse,
  evaluateInterviewWithOpenAI
};
