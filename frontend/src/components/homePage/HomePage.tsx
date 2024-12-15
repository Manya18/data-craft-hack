import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { FiEdit } from "react-icons/fi";
import { MdContentCopy, MdDeleteOutline } from "react-icons/md";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface Survey {
  id: number;
  title: string;
  type: string;
}

const recentSurveys: Survey[] = [
  { id: 1, title: "Опрос удовлетворенности", type: "NPS" },
  { id: 2, title: "Обратная связь", type: "Feedback" },
  { id: 3, title: "Викторина по продукту", type: "Survey" },
];

const surveyTypes = [
  {
    id: 1,
    name: "Викторина/тест",
    description: "Создание викторин с правильными ответами.",
    type: "test",
  },
  {
    id: 2,
    name: "NPS-опрос",
    description: "Измерение уровня удовлетворенности клиентов.",
    type: "nps",
  },
  {
    id: 3,
    name: "Опрос обратной связи",
    description: "Сбор обратной связи от пользователей.",
    type: "feedback",
  },
  {
    id: 4,
    name: "Произвольный опрос",
    description: "Создание опросов с произвольными вопросами.",
    type: "other",
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  console.log(userId);
  const handleCreateSurvey = async (type: string) => {
    try {
      const surveyId = uuidv4();

      const surveyData = {
        id: surveyId,
        user_id: userId,
        type,
      };

      const response = await axios.post(
        "http://localhost:8080/api/surveys",
        surveyData
      );

      console.log("Опрос успешно создан:", response.data);
      navigate(`/survey/${surveyId}`);
    } catch (error) {
      console.error("Ошибка при создании опроса:", error);
    }
  };

  const handleEditSurvey = (id: number) => {
    navigate(`/survey/${id}`);
  };

  const handleCopySurvey = (id: number) => {
    console.log(`Копировать опрос с ID: ${id}`);
  };

  const handleDeleteSurvey = (id: number) => {
    console.log(`Удалить опрос с ID: ${id}`);
  };

  const handlePreviewSurvey = (id: number) => {
    console.log(`Предпросмотр опроса с ID: ${id}`);
  };

  const handleViewResults = (id: number) => {
    console.log(`Просмотр результатов опроса с ID: ${id}`);
  };

  return (
    <div className={styles.container}>
      {/* Секция "Создать опрос" */}
      <div className={styles.createSurveySection}>
        <div className={styles.createSurveySectionTitle}>Создать опрос</div>
        <div className={styles.createSurveyButtons}>
          {surveyTypes.map((type) => (
            <div
              key={type.id}
              className={styles.surveyType}
              onClick={() => handleCreateSurvey(type.type)}
            >
              <div className={styles.surveyTypeContent} />
              <div className={styles.surveyTypeName} title={type.description}>
                {type.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Секция "Недавние опросы" */}
      <div>
        <div className={styles.recentTitle}>Недавние опросы</div>
        {recentSurveys.length > 0 ? (
          <div className={styles.recentList}>
            {recentSurveys.map((survey) => (
              <div className={styles.recentSurveys} key={survey.id}>
                <div className={styles.recentSurveysName}> {survey.title}</div>
                <button
                  className={styles.recentButton}
                  onClick={() => handleEditSurvey(survey.id)}
                >
                  <FiEdit />
                </button>
                <button
                  className={styles.recentButton}
                  onClick={() => handleCopySurvey(survey.id)}
                >
                  <MdContentCopy />
                </button>
                <button
                  className={styles.recentButton}
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  <MdDeleteOutline />
                </button>
                <button
                  className="primary-button"
                  onClick={() => handlePreviewSurvey(survey.id)}
                >
                  Предпросмотр
                </button>
                <button
                  className={styles.recentButton}
                  onClick={() => handleViewResults(survey.id)}
                >
                  Результаты
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.recentTitle}>Нет недавних опросов.</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
