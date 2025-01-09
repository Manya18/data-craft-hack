import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SurveySettings from "./settings/SurveySettings";
import SurveyCustomization from "./customization/SurveyCustomization";
import SurveyQuestions from "./questionList/QuestionList";
import SurveyPreview from "./preview/SurveyPreview";
import styles from "./createSurveyPage.module.css";
import { Divider } from "@mui/material";
import { Question } from "../../types/types";

const { v4: uuidv4 } = require("uuid");

const SurveyCreatorPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [surveyType, setSurveyType] = useState<string>("");

  const [surveyTitle, setSurveyTitle] = useState<string>("Опрос");
  const [surveyDescription, setSurveyDescription] = useState<string>(
    "Описание вашего опроса"
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsPerPage, setQuestionsPerPage] = useState<number>(3);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [titleFontSize, setTitleFontSize] = useState<number>(24);
  const [descriptionFontSize, setDescriptionFontSize] = useState<number>(18);
  const [fontSize, setFontSize] = useState<number>(16);

  const [textColor, setTextColor] = useState<string>("#000000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [buttonColor, setButtonColor] = useState<string>("#f0f0f0");
  const [titleBackgroundColor, setTitleBackgroundColor] =
    useState<string>("#f0f0f0");
  const [descriptionBackgroundColor, setDescriptionBackgroundColor] =
    useState<string>("#ffffff");

  const [logo, setLogo] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const saveSurvey = async (surveyId: string, surveyData: object) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/surveys/${surveyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(surveyData),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при сохранении данных опроса.");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в API saveSurvey:", error);
      throw error;
    }
  };

  const saveQuestions = async (surveyId: string, questions: Question[]) => {
    try {
      const newQuestions = questions.filter((q) => q.isNew); // Новые вопросы
      const existingQuestions = questions.filter((q) => !q.isNew); // Существующие вопросы

      // Сохранение новых вопросов
      if (newQuestions.length > 0) {
        const response = await fetch(
          `http://localhost:8080/api/surveys/${surveyId}/question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newQuestions),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при создании новых вопросов.");
        }

        // Обновляем состояние после успешного сохранения
        const savedQuestions = await response.json();
        setQuestions((prev) =>
          prev.map((q) =>
            newQuestions.some((nq) => nq.id === q.id)
              ? { ...q, isNew: false }
              : q
          )
        );
        setQuestions((prev) => [...prev, ...savedQuestions]);
        console.log("ds", questions);
      }

      // Обновление существующих вопросов
      for (const question of existingQuestions) {
        const response = await fetch(
          `http://localhost:8080/api/surveys/question/${question.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(question),
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка при обновлении вопроса с ID: ${question.id}`);
        }
      }
    } catch (error) {
      console.error("Ошибка в API saveQuestions:", error);
      throw error;
    }
  };

  const handleSaveSurvey = async () => {
    const surveyData = {
      title: surveyTitle,
      description: surveyDescription,
      settings: {
        questionsPerPage,
        fontSize,
        textColor,
        backgroundColor,
        buttonColor,
        titleFontSize,
        descriptionFontSize,
        titleBackgroundColor,
        descriptionBackgroundColor,
        logo,
        backgroundImage,
      },
    };

    try {
      if (!surveyId) {
        console.error("Ошибка: ID опроса не найден в URL.");
        return;
      }

      const savedSurvey = await saveSurvey(surveyId, surveyData);
      console.log("Сохраненные данные:", savedSurvey);
      await saveQuestions(surveyId, questions);
      console.log("Сохранённые вопросы:", questions);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const initializeSurveyData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/survey/${surveyId}`
      );
  
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
  
      const surveyData = await response.json();
      console.log("Данные опроса:", surveyData);
  
      setSurveyTitle(surveyData.title || "Опрос");
      setSurveyType(surveyData.type || "");
      setSurveyDescription(surveyData.description || "Описание вашего опроса");
  
      const settings = surveyData.settings || {};
      setQuestionsPerPage(settings.questionsPerPage || 3);
      setFontSize(settings.fontSize || 16);
      setTextColor(settings.textColor || "#000000");
      setBackgroundColor(settings.backgroundColor || "#ffffff");
      setButtonColor(settings.buttonColor || "#f0f0f0");
      setTitleFontSize(settings.titleFontSize || 24);
      setDescriptionFontSize(settings.descriptionFontSize || 18);
      setTitleBackgroundColor(settings.titleBackgroundColor || "#f0f0f0");
      setDescriptionBackgroundColor(settings.descriptionBackgroundColor || "#ffffff");
      setLogo(settings.logo || "");
      setBackgroundImage(settings.backgroundImage || "");
  
    } catch (error) {
      console.error("Ошибка при инициализации данных опроса:", error);
    }
  };

  const fetchQuestions = async () => {
    if (!surveyId) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/surveys/${surveyId}/questions`
      );
      if (!response.ok) {
        throw new Error(`Ошибка при получении вопросов: ${response.status}`);
      }
      const data = await response.json();
      const formattedQuestions = data.map((q: any) => ({ ...q, isNew: false }));
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Ошибка при загрузке вопросов:", error);
    }
  };

  useEffect(() => {
    if (surveyId) {
      initializeSurveyData();
      fetchQuestions();
    }
  }, [surveyId]);

  return (
    <div>
      <div className={styles.buttonList}>
        <button className="primary-button" onClick={() => navigate("/home")}>
          На главную
        </button>
        <button className="primary-button" onClick={handleSaveSurvey}>
          Сохранить
        </button>
      </div>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.leftSide}>
            <SurveySettings
              surveyTitle={surveyTitle}
              setSurveyTitle={setSurveyTitle}
              titleFontSize={titleFontSize}
              setTitleFontSize={setTitleFontSize}
              titleBackgroundColor={titleBackgroundColor}
              setTitleBackgroundColor={setTitleBackgroundColor}
              surveyDescription={surveyDescription}
              setSurveyDescription={setSurveyDescription}
              descriptionFontSize={descriptionFontSize}
              setDescriptionFontSize={setDescriptionFontSize}
              descriptionBackgroundColor={descriptionBackgroundColor}
              setDescriptionBackgroundColor={setDescriptionBackgroundColor}
              questionsPerPage={questionsPerPage}
              setQuestionsPerPage={setQuestionsPerPage}
            />
            <Divider />
            <SurveyCustomization
              fontSize={fontSize}
              setFontSize={setFontSize}
              textColor={textColor}
              setTextColor={setTextColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              buttonColor={buttonColor}
              setButtonColor={setButtonColor}
              handleLogoUpload={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setLogo(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              handleBackgroundUpload={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setBackgroundImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Divider />
            <SurveyQuestions
              questions={questions}
              setQuestions={setQuestions}
              handleAddQuestion={() =>
                setQuestions([
                  ...questions,
                  {
                    id: uuidv4(),
                    questionText: "",
                    questionType: surveyType,
                    isRequired: false,
                    options: [""],
                    isNew: true,
                  },
                ])
              }
              handleDeleteQuestion={(id) =>
                setQuestions((prev) => prev.filter((q) => q.id !== id))
              }
              handleCopyQuestion={(id) => {
                const questionToCopy = questions.find((q) => q.id === id);
                if (questionToCopy) {
                  setQuestions((prev) => [
                    ...prev,
                    { ...questionToCopy, id: uuidv4(), isNew: true },
                  ]);
                }
              }}
              handleEditQuestion={(id, updatedData) =>
                setQuestions((prev) =>
                  prev.map((q) => (q.id === id ? { ...q, ...updatedData } : q))
                )
              }
            />
          </div>

          <div className={styles.rightSide}>
            <SurveyPreview
              surveyTitle={surveyTitle}
              surveyDescription={surveyDescription}
              questions={currentQuestions}
              currentPage={currentPage}
              totalPages={totalPages}
              textColor={textColor}
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              logo={logo}
              fontSize={fontSize}
              titleFontSize={titleFontSize}
              descriptionFontSize={descriptionFontSize}
              titleBackgroundColor={titleBackgroundColor}
              descriptionBackgroundColor={descriptionBackgroundColor}
              buttonColor={buttonColor}
              buttonTextColor={textColor}
              handleNextPage={() =>
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              handlePrevPage={() =>
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCreatorPage;
