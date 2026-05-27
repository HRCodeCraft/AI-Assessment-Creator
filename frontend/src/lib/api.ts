import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface QuestionTypeRow {
  label: string;
  type: string;
  count: number;
  marksEach: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate?: string;
  timeLimit: number;
  additionalInstructions?: string;
  questionTypes: QuestionTypeRow[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate?: string;
  timeLimit: number;
  additionalInstructions?: string;
  questionTypes: QuestionTypeRow[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
  totalMarks: number;
  totalQuestions: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  number: number;
  text: string;
  type: string;
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface Section {
  id: string;
  title: string;
  questionType: string;
  instruction: string;
  totalMarks: number;
  questions: Question[];
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  metadata: {
    title: string;
    subject: string;
    grade: string;
    topic: string;
    totalMarks: number;
    duration: string;
    instructions: string[];
  };
  sections: Section[];
  generatedAt: string;
}

export const assignmentsApi = {
  list: () => api.get<{ success: boolean; data: Assignment[] }>('/assignments'),
  get: (id: string) => api.get<{ success: boolean; data: Assignment }>(`/assignments/${id}`),
  create: (data: AssignmentFormData, file?: File) => {
    if (file) {
      const form = new FormData();
      form.append('data', JSON.stringify(data));
      form.append('file', file);
      return api.post<{ success: boolean; data: { assignmentId: string; jobId: string; totalMarks: number; totalQuestions: number } }>(
        '/assignments', form, { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    }
    return api.post<{ success: boolean; data: { assignmentId: string; jobId: string; totalMarks: number; totalQuestions: number } }>(
      '/assignments', data
    );
  },
  delete: (id: string) => api.delete(`/assignments/${id}`),
  getProgress: (id: string) =>
    api.get<{ success: boolean; data: { percentage: number; message: string; status: string; paperId?: string } }>(
      `/assignments/${id}/progress`
    ),
};

export const papersApi = {
  get: (id: string) => api.get<{ success: boolean; data: QuestionPaper }>(`/papers/${id}`),
};
