/**
 * AI Resume Analyzer
 * Supports multiple AI providers: OpenAI, Anthropic Claude, Google Gemini
 */

interface AnalyzerConfig {
  provider: 'openai' | 'anthropic' | 'gemini';
  apiKey: string;
  model?: string;
}

interface AnalysisRequest {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
}

// Get API keys from environment
const getConfig = (): AnalyzerConfig => {
  // Try OpenAI first
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: 'gpt-4o-mini' // Cost-effective and accurate
    };
  }

  // Try Anthropic Claude
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
    return {
      provider: 'anthropic',
      apiKey: anthropicKey,
      model: 'claude-3-5-sonnet-20241022'
    };
  }

  // Try Google Gemini
  const geminiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (geminiKey && geminiKey !== 'your_google_api_key_here') {
    return {
      provider: 'gemini',
      apiKey: geminiKey,
      model: 'gemini-2.0-flash-lite'
    };
  }

  throw new Error('No AI API key configured. Please add VITE_OPENAI_API_KEY, VITE_ANTHROPIC_API_KEY, or VITE_GOOGLE_API_KEY to your .env file');
};

const createPrompt = (request: AnalysisRequest): string => {
  return `You are an expert ATS (Applicant Tracking System) and resume analysis specialist. Analyze this resume thoroughly and provide detailed, actionable feedback.

RESUME CONTENT:
${request.resumeText}

JOB DETAILS:
- Position: ${request.jobTitle}
- Description: ${request.jobDescription}

ANALYSIS REQUIREMENTS:
1. Evaluate ATS compatibility (keywords, formatting, structure)
2. Assess tone and writing style (professional, clear, impactful)
3. Review content quality (achievements, quantifiable results, relevance)
4. Analyze structure and organization
5. Evaluate skills presentation and relevance to the role

Provide scores (0-100) and specific, actionable tips for each category.
Be honest - give low scores if the resume needs significant improvement.
Focus on how well the resume matches the ${request.jobTitle} position.

CRITICAL: Return ONLY valid JSON in this exact format (no markdown, no explanation, no code blocks):

{
  "overallScore": <number>,
  "ATS": {
    "score": <number>,
    "tips": [
      {"type": "good" | "improve", "tip": "specific tip text"}
    ]
  },
  "toneAndStyle": {
    "score": <number>,
    "tips": [
      {"type": "good" | "improve", "tip": "title", "explanation": "detailed explanation"}
    ]
  },
  "content": {
    "score": <number>,
    "tips": [
      {"type": "good" | "improve", "tip": "title", "explanation": "detailed explanation"}
    ]
  },
  "structure": {
    "score": <number>,
    "tips": [
      {"type": "good" | "improve", "tip": "title", "explanation": "detailed explanation"}
    ]
  },
  "skills": {
    "score": <number>,
    "tips": [
      {"type": "good" | "improve", "tip": "title", "explanation": "detailed explanation"}
    ]
  }
}

Include 3-4 tips per category. Return ONLY the JSON object.`;
};

// OpenAI API call
const analyzeWithOpenAI = async (config: AnalyzerConfig, prompt: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert resume analyzer. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Anthropic Claude API call
const analyzeWithAnthropic = async (config: AnalyzerConfig, prompt: string) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

// Google Gemini API call
const analyzeWithGemini = async (config: AnalyzerConfig, prompt: string) => {
  const modelName = config.model || 'gemini-2.0-flash-lite';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Main analyzer function
export const analyzeResume = async (request: AnalysisRequest): Promise<Feedback> => {
  try {
    const config = getConfig();
    const prompt = createPrompt(request);

    console.log(`Using AI Provider: ${config.provider}`);

    let responseText: string;

    switch (config.provider) {
      case 'openai':
        responseText = await analyzeWithOpenAI(config, prompt);
        break;
      case 'anthropic':
        responseText = await analyzeWithAnthropic(config, prompt);
        break;
      case 'gemini':
        responseText = await analyzeWithGemini(config, prompt);
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    console.log('AI Response:', responseText);

    // Clean and parse response
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Extract JSON if there's extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const feedback = JSON.parse(cleanedText);
    console.log('Parsed feedback:', feedback);

    return feedback;
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
};

// Check if AI is configured
export const isAIConfigured = (): boolean => {
  try {
    getConfig();
    return true;
  } catch {
    return false;
  }
};
