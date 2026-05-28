import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { IAssignment } from '../models/Assignment';

export interface GeneratedPaper {
  metadata: {
    title: string;
    subject: string;
    grade: string;
    topic: string;
    totalMarks: number;
    duration: string;
    instructions: string[];
  };
  sections: Array<{
    id: string;
    title: string;
    questionType: string;
    instruction: string;
    totalMarks: number;
    questions: Array<{
      number: number;
      text: string;
      type: string;
      options?: string[];
      difficulty: 'easy' | 'medium' | 'hard';
      marks: number;
      correctAnswer: string;
    }>;
  }>;
}

function buildPrompt(assignment: IAssignment): string {
  const { questionTypes, difficultyDistribution } = assignment;
  const hours = Math.floor(assignment.timeLimit / 60);
  const minutes = assignment.timeLimit % 60;
  const duration =
    hours > 0
      ? `${hours} Hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} Minutes` : ''}`
      : `${minutes} Minutes`;

  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const sectionBreakdown = questionTypes
    .map(
      (qt, i) =>
        `Section ${sectionLetters[i]}: ${qt.label} — ${qt.count} questions × ${qt.marksEach} mark${qt.marksEach !== 1 ? 's' : ''} = ${qt.count * qt.marksEach} marks`
    )
    .join('\n');

  const isMCQ = (label: string) => /multiple.?choice|mcq/i.test(label);
  const isTF = (label: string) => /true.?false|yes.?no/i.test(label);

  const fileContext = assignment.fileContent
    ? `\n\nIMPORTANT — REFERENCE MATERIAL (base your questions on this content):\n"""\n${assignment.fileContent.slice(0, 3000)}\n"""\nAll questions MUST be directly based on the above reference material.`
    : '';

  return `You are an expert academic exam paper creator. Generate a comprehensive question paper.

DETAILS:
- Subject: ${assignment.subject}
- Grade/Class: ${assignment.grade}
- Topic: ${assignment.topic}
- Duration: ${duration}
- Instructions: ${assignment.additionalInstructions || 'Standard exam conditions'}
${fileContext}

SECTIONS REQUIRED:
${sectionBreakdown}

DIFFICULTY (approximate):
- Easy: ${difficultyDistribution.easy}%
- Medium: ${difficultyDistribution.medium}%
- Hard: ${difficultyDistribution.hard}%

STRICT RULES:
1. Return ONLY valid JSON — no markdown fences, no explanation text whatsoever
2. Questions must be relevant to "${assignment.topic}" in "${assignment.subject}" for ${assignment.grade}
3. MCQ options must be labeled "A. ...", "B. ...", "C. ...", "D. ..."
4. True/False options: ["A. True", "B. False"]
5. Question numbers are sequential across all sections
6. Honor exact counts and marks per question
7. Questions must be clear, grade-appropriate, and educationally valid
8. Every question MUST have a "correctAnswer" field:
   - For MCQ: the full correct option text e.g. "B. Mitochondria"
   - For True/False: "A. True" or "B. False"
   - For short/long answer: a concise model answer (1-3 sentences max)

Return this exact JSON structure:
{
  "metadata": {
    "title": "Question Paper: ${assignment.topic}",
    "subject": "${assignment.subject}",
    "grade": "${assignment.grade}",
    "topic": "${assignment.topic}",
    "totalMarks": <sum of all marks>,
    "duration": "${duration}",
    "instructions": ["All questions are compulsory.", "Read carefully before answering.", "Mobile phones not permitted."]
  },
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "questionType": "${questionTypes[0]?.label || 'Questions'}",
      "instruction": "Attempt all questions.",
      "totalMarks": <section total>,
      "questions": [
        {
          "number": 1,
          "text": "Question text here?",
          "type": "${isMCQ(questionTypes[0]?.label || '') ? 'mcq' : isTF(questionTypes[0]?.label || '') ? 'true-false' : 'short'}",
          "options": ${isMCQ(questionTypes[0]?.label || '') ? '["A. opt1","B. opt2","C. opt3","D. opt4"]' : 'null'},
          "difficulty": "easy",
          "marks": ${questionTypes[0]?.marksEach || 1},
          "correctAnswer": "B. [correct option text]"
        }
      ]
    }
  ]
}`;
}

function parseAndValidate(raw: string): GeneratedPaper {
  let cleaned = raw.trim();

  // Strip any markdown fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Extract outermost JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    console.error('[AI] Raw response (no JSON found):', raw.slice(0, 500));
    throw new Error('AI did not return JSON. Raw: ' + raw.slice(0, 200));
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);

  let parsed: GeneratedPaper;
  try {
    parsed = JSON.parse(cleaned) as GeneratedPaper;
  } catch (e) {
    console.error('[AI] JSON parse failed. Raw snippet:', cleaned.slice(0, 500));
    throw new Error('AI returned invalid JSON: ' + (e as Error).message);
  }

  if (!parsed.metadata || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure returned by AI');
  }

  // Normalize question types to match MongoDB enum
  const normalizeType = (t: string): string => {
    const s = t.toLowerCase().replace(/[^a-z]/g, '');
    if (s === 'truefalse' || s === 'tf' || s === 'yesno') return 'true-false';
    if (s === 'multiplechoice' || s === 'mcq' || s === 'mc') return 'mcq';
    if (s === 'shortanswer' || s === 'short') return 'short';
    if (s === 'longanswer' || s === 'long' || s === 'essay') return 'long';
    if (s === 'fillintheblanks' || s === 'fillblank' || s === 'fill') return 'short';
    if (s === 'diagram' || s === 'numerical') return 'long';
    return 'short';
  };

  let totalMarks = 0;
  for (const section of parsed.sections) {
    let sectionTotal = 0;
    for (const q of section.questions) {
      q.type = normalizeType(q.type);
      sectionTotal += q.marks;
    }
    section.totalMarks = sectionTotal;
    totalMarks += sectionTotal;
  }
  parsed.metadata.totalMarks = totalMarks;

  return parsed;
}

// Tokens needed ≈ 220 per question + 80 per section + 500 overhead
function calcMaxTokens(assignment: IAssignment): number {
  const totalQ = assignment.questionTypes.reduce((s, qt) => s + qt.count, 0);
  const sections = assignment.questionTypes.length;
  return Math.min(Math.ceil(totalQ * 220 + sections * 80 + 600), 10500);
}

async function callGroq(
  prompt: string,
  maxTokens: number,
  onProgress?: (percentage: number, message: string) => void,
  attempt = 0
): Promise<string> {
  try {
    const { data } = await axios.post<{ choices: Array<{ message: { content: string } }> }>(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert exam paper creator. Respond with ONLY valid JSON — no markdown, no prose, no explanation.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'json',
        decompress: true,
      }
    );
    return data.choices[0]?.message?.content || '';
  } catch (err) {
    const axErr = err as AxiosError<{ error?: { message?: string } }>;
    const status = axErr.response?.status ?? 0;
    const errMsg = axErr.response?.data?.error?.message ?? axErr.message;

    if (status === 429 || status === 413) {
      const waitMatch = errMsg.match(/try again in ([0-9.]+)s/i);
      const waitSec = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 3 : 65;

      if (attempt < 3) {
        onProgress?.(30, `Rate limit reached. Retrying in ${waitSec}s... (${attempt + 1}/3)`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        onProgress?.(40, `Retrying... (${attempt + 2}/3)`);
        return callGroq(prompt, maxTokens, onProgress, attempt + 1);
      }
      throw new Error(`Rate limit exceeded. Please wait 1 minute and try again.`);
    }

    throw new Error(`Groq API error ${status}: ${errMsg}`);
  }
}

export async function generateQuestionPaper(
  assignment: IAssignment,
  onProgress?: (percentage: number, message: string) => void
): Promise<GeneratedPaper> {
  const prompt = buildPrompt(assignment);
  const maxTokens = calcMaxTokens(assignment);

  onProgress?.(10, 'Analyzing assignment requirements...');
  onProgress?.(25, 'Connecting to Groq AI...');

  const raw = await callGroq(prompt, maxTokens, onProgress);

  onProgress?.(85, 'Generating questions...');
  onProgress?.(92, 'Validating and organizing...');

  const paper = parseAndValidate(raw);
  onProgress?.(100, 'Question paper ready!');

  return paper;
}
