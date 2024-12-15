import React, { useState, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";
import styles from "./SurveyCustomization.module.css";

interface SurveyCustomizationProps {
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  buttonColor: string;
  setButtonColor: React.Dispatch<React.SetStateAction<string>>;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SurveyCustomization: React.FC<SurveyCustomizationProps> = ({
  fontSize,
  setFontSize,
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
  buttonColor,
  setButtonColor,
  handleLogoUpload,
  handleBackgroundUpload,
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] =
    useState(false);
  const [showButtonColorPicker, setShowButtonColorPicker] = useState(false);

  const textColorPickerRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const buttonColorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textColorPickerRef.current &&
        !textColorPickerRef.current.contains(event.target as Node) &&
        backgroundColorPickerRef.current &&
        !backgroundColorPickerRef.current.contains(event.target as Node) &&
        buttonColorPickerRef.current &&
        !buttonColorPickerRef.current.contains(event.target as Node)
      ) {
        setShowTextColorPicker(false);
        setShowBackgroundColorPicker(false);
        setShowButtonColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.customization}>
      <div className={styles.field}>
        <div className={styles.title}>Размер текста</div>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          min={10}
          max={50}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.title}>Цвет фона</div>
        <div className={styles.colorPickerContainer}>
          <div
            className={styles.colorCircle}
            style={{ backgroundColor: backgroundColor }}
            onClick={() =>
              setShowBackgroundColorPicker(!showBackgroundColorPicker)
            }
          />
          {showBackgroundColorPicker && (
            <div ref={backgroundColorPickerRef} className={styles.colorPickerWrapper}>
              <SketchPicker
                color={backgroundColor}
                onChangeComplete={(color) => setBackgroundColor(color.hex)}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.title}>Лого</div>
        <input type="file" onChange={handleLogoUpload} />
      </div>

      <div className={styles.field}>
        <div className={styles.title}>Цвет текста</div>
        <div className={styles.colorPickerContainer}>
          <div
            className={styles.colorCircle}
            style={{ backgroundColor: textColor }}
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          />
          {showTextColorPicker && (
            <div ref={textColorPickerRef} className={styles.colorPickerWrapper}>
              <SketchPicker
                color={textColor}
                onChangeComplete={(color) => setTextColor(color.hex)}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.title}>Цвет кнопок</div>
        <div className={styles.colorPickerContainer}>
          <div
            className={styles.colorCircle}
            style={{ backgroundColor: buttonColor }}
            onClick={() => setShowButtonColorPicker(!showButtonColorPicker)}
          />
          {showButtonColorPicker && (
            <div ref={buttonColorPickerRef} className={styles.colorPickerWrapper}>
              <SketchPicker
                color={buttonColor}
                onChangeComplete={(color) => setButtonColor(color.hex)}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.title}>Фоновая картинка</div>
        <input type="file" onChange={handleBackgroundUpload} />
      </div>
    </div>
  );
};

export default SurveyCustomization;
