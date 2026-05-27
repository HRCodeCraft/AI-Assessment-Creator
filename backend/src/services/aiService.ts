import Groq from 'groq-sdk';
import { config } from '../config';
import { IAssignment } from '../models/Assignment';

const groq = new Groq({ apiKey: config.groqApiKey });

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
    ? `\nREFERENCE MATERIAL:\n${assignment.fileContent.slice(0, 3000)}`
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
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned) as GeneratedPaper;

  if (!parsed.metadata || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure returned by AI');
  }

  let totalMarks = 0;
  for (const section of parsed.sections) {
    let sectionTotal = 0;
    for (const q of section.questions) sectionTotal += q.marks;
    section.totalMarks = sectionTotal;
    totalMarks += sectionTotal;
  }
  parsed.metadata.totalMarks = totalMarks;

  return parsed;
}

export async function generateQuestionPaper(
  assignment: IAssignment,
  onProgress?: (percentage: number, message: string) => void
): Promise<GeneratedPaper> {
  const prompt = buildPrompt(assignment);

  onProgress?.(10, 'Analyzing assignment requirements...');
  onProgress?.(25, 'Connecting to Groq AI...');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert exam paper creator. Respond with ONLY valid JSON — no markdown, no prose, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  });

  onProgress?.(85, 'Generating questions...');

  const raw = response.choices[0]?.message?.content || '';
  onProgress?.(92, 'Validating and organizing...');

  const paper = parseAndValidate(raw);
  onProgress?.(100, 'Question paper ready!');

  return paper;
}
