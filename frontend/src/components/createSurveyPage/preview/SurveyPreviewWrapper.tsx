import { useParams } from "react-router-dom";
import SurveyPreview from "./SurveyPreview";
import { useEffect, useState } from "react";

interface SurveyData {
    surveyTitle: string;
    surveyDescription: string;
    questions: { questionText: string; questionType: string }[];
    currentPage: number;
    totalPages: number;
    textColor: string;
    backgroundColor: string;
    backgroundImage: string;
    logo: string;
    fontSize: number;
    titleFontSize: number;
    descriptionFontSize: number;
    titleBackgroundColor: string;
    descriptionBackgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
    handleNextPage: () => void;
    handlePrevPage: () => void;
  }
  
const SurveyPreviewWrapper = () => {
  const { surveyId } = useParams();

  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/survey/${surveyId}`)
      .then((res) => res.json())
      .then((data) => setSurveyData({
        surveyTitle: data.surveyTitle || "Default Title",
        surveyDescription: data.surveyDescription || "Default Description",
        questions: data.questions || [],
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        textColor: data.textColor || "#000",
        backgroundColor: data.backgroundColor || "#fff",
        backgroundImage: data.backgroundImage || "",
        logo: data.logo || "",
        fontSize: data.fontSize || 16,
        titleFontSize: data.titleFontSize || 20,
        descriptionFontSize: data.descriptionFontSize || 18,
        titleBackgroundColor: data.titleBackgroundColor || "#f5f5f5",
        descriptionBackgroundColor: data.descriptionBackgroundColor || "#e5e5e5",
        buttonColor: data.buttonColor || "#007BFF",
        buttonTextColor: data.buttonTextColor || "#fff",
        handleNextPage: () => console.log("Next page"),
        handlePrevPage: () => console.log("Previous page"),
      }));
  }, [surveyId]);

  if (!surveyData) return <div>Загрузка...</div>;

  return <SurveyPreview {...surveyData} />;
};

export default SurveyPreviewWrapper;
