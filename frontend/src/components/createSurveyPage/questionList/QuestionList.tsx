import React from "react";
import styles from "./QuestionList.module.css";
import { MdContentCopy, MdDeleteOutline } from "react-icons/md";
import { Question } from "../../../types/types";

interface QuestionListProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleAddQuestion: () => void;
  handleDeleteQuestion: (id: string) => void;
  handleCopyQuestion: (id: string) => void;
  handleEditQuestion: (id: string, updatedData: Question[]) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  setQuestions,
  handleAddQuestion,
  handleDeleteQuestion,
  handleCopyQuestion,
}) => {
  const handleOptionChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === index ? value : opt)),
            }
          : q
      )
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q
      )
    );
  };

  const handleRemoveOption = (questionId: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q
      )
    );
  };

  const handleEditQuestion = (id: string, field: string, value: any) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(question =>
        question.id === id ? { ...question, [field]: value } : question
      )
    );
  };
  return (
    <div className={styles.questions}>
      <button onClick={handleAddQuestion} className="primary-button">
        Добавить вопрос
      </button>
      {questions.map((question) => (
        <div key={question.id} className={styles.questionBlock}>
          <div>
            <div className={styles.title}>
              {" "}
              {question.questionType === "feedback" ? "Функция" : "Вопрос"}
            </div>
            <input
              type="text"
              style={{ width: "500px", resize: "both", overflow: "auto" }}
              value={question.questionText}
              onChange={(e) =>
                handleEditQuestion(question.id, "questionText", e.target.value)
              }
            />
          </div>

          {question.questionType === "test" && (
            <>
              <div>
                <div>
                  Обязательный:
                  <input
                    type="checkbox"
                    checked={question.isRequired || false}
                    onChange={(e) =>
                      handleEditQuestion(question.id, "isRequired", e.target.checked)
                    }
                  />
                </div>
                <div>
                  <div>Тип ответа:</div>
                  <select
                    value={question.answerType || "single"}
                    onChange={(e) =>
                      handleEditQuestion(question.id, "answerType", e.target.value)
                    }
                  >
                    <option value="single">Одиночный</option>
                    <option value="multiple">Множественный</option>
                    <option value="text">Текст</option>
                  </select>
                </div>
              </div>
              {question.answerType !== "text" && (
                <div>
                  <div>Варианты ответа:</div>
                  {question.options?.map((option, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(question.id, index, e.target.value)
                        }
                      />
                      {question.answerType === "single" ? (
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswers?.[0] === index}
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((q) =>
                                q.id === question.id
                                  ? { ...q, correctAnswers: [index] }
                                  : q
                              )
                            )
                          }
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={
                            question.correctAnswers?.includes(index) || false
                          }
                          onChange={(e) =>
                            setQuestions((prev) =>
                              prev.map((q) => {
                                if (q.id === question.id) {
                                  const isChecked = e.target.checked;
                                  const updatedAnswers = isChecked
                                    ? [...(q.correctAnswers || []), index]
                                    : q.correctAnswers?.filter(
                                        (i) => i !== index
                                      );
                                  return {
                                    ...q,
                                    correctAnswers: updatedAnswers,
                                  };
                                }
                                return q;
                              })
                            )
                          }
                        />
                      )}
                      <button
                        onClick={() => handleRemoveOption(question.id, index)}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                  <button onClick={() => handleAddOption(question.id)}>
                    Добавить вариант
                  </button>
                </div>
              )}
            </>
          )}

          {question.questionType === "feedback" && (
            <>
              <div>
                <div className={styles.title}>Описание функции:</div>
                <input
                  value={question.featureDescription || ""}
                  style={{ width: "500px", resize: "both", overflow: "auto" }}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((q) =>
                        q.id === question.id
                          ? { ...q, featureDescription: e.target.value }
                          : q
                      )
                    )
                  }
                />
              </div>
            </>
          )}
          <div className={styles.icons}>
            <button
              onClick={() => handleCopyQuestion(question.id)}
              className={styles.iconButton}
            >
              <MdContentCopy />
            </button>
            <button
              onClick={() => handleDeleteQuestion(question.id)}
              className={styles.iconButton}
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
