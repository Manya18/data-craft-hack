import React from "react";
import styles from "./QuestionList.module.css";
import { MdContentCopy, MdDeleteOutline } from "react-icons/md";


interface Question {
  id: number;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  options: string[];
}

interface QuestionListProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleAddQuestion: () => void;
  handleDeleteQuestion: (id: number) => void;
  handleCopyQuestion: (id: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  setQuestions,
  handleAddQuestion,
  handleDeleteQuestion,
  handleCopyQuestion,
}) => {
  return (
    <div className={styles.questions}>
      <button onClick={handleAddQuestion} className="primary-button">
        Добавить вопрос
      </button>
      {questions.map((question) => (
        <div key={question.id} className={styles.questionBlock}>
          <div>
          <div className={styles.title}>Вопрос</div>
            <input
              type="text"
              value={question.questionText}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((q) =>
                    q.id === question.id
                      ? { ...q, questionText: e.target.value }
                      : q
                  )
                )
              }
            />
          </div>
          <div className={styles.icons}>
            <button
              onClick={() => handleCopyQuestion(question.id)}
              className={styles.icontButton}
            >
              <MdContentCopy />
            </button>
            <button
              onClick={() => handleDeleteQuestion(question.id)}
              className={styles.icontButton}
            >
              <MdDeleteOutline />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
