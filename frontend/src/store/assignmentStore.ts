import { create } from 'zustand';
import { Assignment, QuestionPaper } from '@/lib/api';

interface GenerationState {
  isGenerating: boolean;
  percentage: number;
  message: string;
  assignmentId: string | null;
  paperId: string | null;
  error: string | null;
}

interface AssignmentStore {
  assignments: Assignment[];
  currentPaper: QuestionPaper | null;
  generation: GenerationState;

  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;

  setCurrentPaper: (paper: QuestionPaper | null) => void;

  startGeneration: (assignmentId: string) => void;
  updateGeneration: (percentage: number, message: string) => void;
  completeGeneration: (paperId: string) => void;
  failGeneration: (error: string) => void;
  resetGeneration: () => void;
}

const initialGeneration: GenerationState = {
  isGenerating: false,
  percentage: 0,
  message: '',
  assignmentId: null,
  paperId: null,
  error: null,
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentPaper: null,
  generation: initialGeneration,

  setAssignments: (assignments) => set({ assignments }),

  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),

  removeAssignment: (id) =>
    set((state) => ({ assignments: state.assignments.filter((a) => a._id !== id) })),

  setCurrentPaper: (paper) => set({ currentPaper: paper }),

  startGeneration: (assignmentId) =>
    set({
      generation: {
        isGenerating: true,
        percentage: 0,
        message: 'Starting AI generation...',
        assignmentId,
        paperId: null,
        error: null,
      },
    }),

  updateGeneration: (percentage, message) =>
    set((state) => ({
      generation: { ...state.generation, percentage, message },
    })),

  completeGeneration: (paperId) =>
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: false,
        percentage: 100,
        message: 'Complete!',
        paperId,
      },
    })),

  failGeneration: (error) =>
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: false,
        error,
        message: error,
      },
    })),

  resetGeneration: () => set({ generation: initialGeneration }),
}));
