export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  isRequired?: boolean;
  options?: string[];
  correctAnswers?: number[];
  answerType?: "single" | "multiple" | "text";
  featureDescription?: string;
  isNew?: boolean;
}
