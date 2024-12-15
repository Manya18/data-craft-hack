import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import SurveySettings from "./settings/SurveySettings";
import SurveyCustomization from "./customization/SurveyCustomization";
import SurveyQuestions from "./questionList/QuestionList";
import SurveyPreview from "./preview/SurveyPreview";
import styles from "./createSurveyPage.module.css";
import { Divider } from "@mui/material";

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  options: string[];
}

const SurveyCreatorPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

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
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при сохранении данных опроса.");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка в API saveSurvey:", error);
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
        alert("Ошибка: ID опроса не найден в URL.");
        return;
      }

      const savedSurvey = await saveSurvey(surveyId, surveyData);
      alert("Опрос успешно сохранен!");
      console.log("Сохраненные данные:", savedSurvey);
    } catch (error) {
      alert("Ошибка при сохранении опроса. Попробуйте снова.");
      console.error("Ошибка:", error);
    }
  };

  return (
    <div>
      <div className={styles.buttonList}>
        <button className="primary-button" onClick={() => navigate("/home")}>
          На главную
        </button>
        <button className="save-button" onClick={handleSaveSurvey}>
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
                    id: Date.now(),
                    questionText: "",
                    questionType: "nps",
                    isRequired: false,
                    options: [""],
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
                    { ...questionToCopy, id: Date.now() },
                  ]);
                }
              }}
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
