import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionTypeRow {
  label: string;
  type: string;
  count: number;
  marksEach: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  dueDate?: Date;
  timeLimit: number;
  additionalInstructions?: string;
  fileContent?: string;
  questionTypes: IQuestionTypeRow[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalMarks: number;
  totalQuestions: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paperId?: mongoose.Types.ObjectId;
  jobId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeRowSchema = new Schema<IQuestionTypeRow>(
  {
    label: { type: String, required: true },
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksEach: { type: Number, required: true, min: 0.5 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    dueDate: { type: Date },
    timeLimit: { type: Number, required: true, min: 10, default: 60 },
    additionalInstructions: { type: String, trim: true },
    fileContent: { type: String },
    questionTypes: { type: [QuestionTypeRowSchema], required: true },
    difficultyDistribution: {
      easy: { type: Number, default: 40, min: 0, max: 100 },
      medium: { type: Number, default: 40, min: 0, max: 100 },
      hard: { type: Number, default: 20, min: 0, max: 100 },
    },
    totalMarks: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    paperId: { type: Schema.Types.ObjectId, ref: 'QuestionPaper' },
    jobId: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
