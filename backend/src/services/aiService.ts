import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { IAssignment } from '../models/Assignment';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

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

  const isMCQ = (label: string) =>
    /multiple.?choice|mcq/i.test(label);
  const isTF = (label: string) =>
    /true.?false|yes.?no/i.test(label);

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

RULES:
1. Return ONLY valid JSON — no markdown, no explanation
2. Questions must be relevant to "${assignment.topic}" in "${assignment.subject}" for ${assignment.grade}
3. For MCQ/True-False: include "options" array (MCQ: 4 options labeled "A. ...", TF: ["A. True","B. False"])
4. Question numbers are sequential across all sections
5. Honor exact counts and marks per question
6. Questions must be clear, grade-appropriate, and educationally valid

JSON structure:
{
  "metadata": {
    "title": "Question Paper: ${assignment.topic}",
    "subject": "${assignment.subject}",
    "grade": "${assignment.grade}",
    "topic": "${assignment.topic}",
    "totalMarks": <calculated>,
    "duration": "${duration}",
    "instructions": ["All questions are compulsory.", "Read carefully before answering.", "Mobile phones not permitted."]
  },
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "questionType": "${questionTypes[0]?.label || 'questions'}",
      "instruction": "Attempt all questions.",
      "totalMarks": <section total>,
      "questions": [
        {
          "number": 1,
          "text": "...",
          "type": "${isMCQ(questionTypes[0]?.label || '') ? 'mcq' : isTF(questionTypes[0]?.label || '') ? 'true-false' : 'short'}",
          "options": ${isMCQ(questionTypes[0]?.label || '') ? '["A. opt1","B. opt2","C. opt3","D. opt4"]' : isTF(questionTypes[0]?.label || '') ? '["A. True","B. False"]' : 'null'},
          "difficulty": "easy",
          "marks": ${questionTypes[0]?.marksEach || 1}
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

  const parsed = JSON.parse(cleaned) as GeneratedPaper;

  if (!parsed.metadata || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid paper structure returned by AI');
  }

  // Recalculate totals to ensure accuracy
  let totalMarks = 0;
  for (const section of parsed.sections) {
    let sectionTotal = 0;
    for (const q of section.questions) {
      sectionTotal += q.marks;
    }
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

  let fullResponse = '';
  let chunkCount = 0;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system:
      'You are an expert exam paper creator. Respond with ONLY valid JSON — no markdown, no prose.',
    messages: [{ role: 'user', content: prompt }],
  });

  onProgress?.(20, 'Structuring the exam format...');

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      fullResponse += chunk.delta.text;
      chunkCount++;
      if (chunkCount % 20 === 0) {
        const estimated = Math.min(20 + Math.floor((fullResponse.length / 7000) * 65), 88);
        onProgress?.(estimated, 'Generating questions...');
      }
    }
  }

  onProgress?.(90, 'Validating and organizing...');
  const paper = parseAndValidate(fullResponse);
  onProgress?.(100, 'Question paper ready!');

  return paper;
}
