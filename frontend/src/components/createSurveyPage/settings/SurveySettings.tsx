import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import styles from "./SurveySettings.module.css";

interface SurveySettingsProps {
  surveyTitle: string;
  setSurveyTitle: React.Dispatch<React.SetStateAction<string>>;
  titleFontSize: number;
  setTitleFontSize: React.Dispatch<React.SetStateAction<number>>;
  titleBackgroundColor: string;
  setTitleBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  surveyDescription: string;
  setSurveyDescription: React.Dispatch<React.SetStateAction<string>>;
  descriptionFontSize: number;
  setDescriptionFontSize: React.Dispatch<React.SetStateAction<number>>;
  descriptionBackgroundColor: string;
  setDescriptionBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  questionsPerPage: number;
  setQuestionsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

const SurveySettings: React.FC<SurveySettingsProps> = ({
  surveyTitle,
  setSurveyTitle,
  titleFontSize,
  setTitleFontSize,
  titleBackgroundColor,
  setTitleBackgroundColor,
  surveyDescription,
  setSurveyDescription,
  descriptionFontSize,
  setDescriptionFontSize,
  descriptionBackgroundColor,
  setDescriptionBackgroundColor,
  questionsPerPage,
  setQuestionsPerPage,
}) => {
  const [showTitleColorPicker, setShowTitleColorPicker] = useState(false);
  const [showDescriptionColorPicker, setShowDescriptionColorPicker] =
    useState(false);

  const titleColorPickerRef = useRef<HTMLDivElement>(null);
  const descriptionColorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleColorPickerRef.current &&
        !titleColorPickerRef.current.contains(event.target as Node) &&
        descriptionColorPickerRef.current &&
        !descriptionColorPickerRef.current.contains(event.target as Node)
      ) {
        setShowTitleColorPicker(false);
        setShowDescriptionColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.settings}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <div className={styles.title}>Название</div>
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            style={{ width: "300px", resize: "both", overflow: "auto" }}
          />
        </div>
        <div
          className={styles.field}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div className={styles.title}>Размер текста</div>
          <input
            type="number"
            value={titleFontSize}
            onChange={(e) => setTitleFontSize(Number(e.target.value))}
            min={10}
            max={50}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.title}>Цвет фона</div>
          <div className={styles.colorPickerContainer}>
            <div
              className={styles.colorCircle}
              style={{ backgroundColor: titleBackgroundColor }}
              onClick={() => setShowTitleColorPicker(!showTitleColorPicker)}
            />
            {showTitleColorPicker && (
              <div
                className={styles.colorPickerWrapper}
                ref={titleColorPickerRef}
              >
                <SketchPicker
                  color={titleBackgroundColor}
                  onChangeComplete={(color) =>
                    setTitleBackgroundColor(color.hex)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <div className={styles.title}>Описание</div>
          <input
            type="text"
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            style={{ width: "300px", resize: "both", overflow: "auto" }}
          />
        </div>
        <div
          className={styles.field}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <div className={styles.title}>Размер текста</div>
          <input
            type="number"
            value={descriptionFontSize}
            onChange={(e) => setDescriptionFontSize(Number(e.target.value))}
            min={10}
            max={50}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.title}>Цвет фона</div>
          <div className={styles.colorPickerContainer}>
            <div
              className={styles.colorCircle}
              style={{ backgroundColor: descriptionBackgroundColor }}
              onClick={() =>
                setShowDescriptionColorPicker(!showDescriptionColorPicker)
              }
            />
            {showDescriptionColorPicker && (
              <div
                className={styles.colorPickerWrapper}
                ref={descriptionColorPickerRef}
              >
                <SketchPicker
                  color={descriptionBackgroundColor}
                  onChangeComplete={(color) =>
                    setDescriptionBackgroundColor(color.hex)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.title}>Количество вопросов на странице</div>
        <input
          type="number"
          value={questionsPerPage}
          onChange={(e) => setQuestionsPerPage(Number(e.target.value))}
          min={1}
          max={50}
        />
      </div>
    </div>
  );
};

export default SurveySettings;
