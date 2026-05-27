import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  number: number;
  text: string;
  type: 'mcq' | 'short' | 'long' | 'true-false';
  options?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  correctAnswer?: string;
}

export interface ISection {
  id: string;
  title: string;
  questionType: string;
  instruction: string;
  totalMarks: number;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  metadata: {
    title: string;
    subject: string;
    grade: string;
    topic: string;
    totalMarks: number;
    duration: string;
    instructions: string[];
  };
  sections: ISection[];
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long', 'true-false'],
      required: true,
    },
    options: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks: { type: Number, required: true },
    correctAnswer: { type: String },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    questionType: { type: String, required: true },
    instruction: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    questions: [QuestionSchema],
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    metadata: {
      title: { type: String, required: true },
      subject: { type: String, required: true },
      grade: { type: String, required: true },
      topic: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      duration: { type: String, required: true },
      instructions: [{ type: String }],
    },
    sections: [SectionSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
