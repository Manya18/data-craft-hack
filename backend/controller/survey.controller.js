const bcrypt = require("bcrypt");

class SurveyController {
  constructor(db) {
    this.db = db;
  }

  // Создание опроса
  async createSurvey(req, res) {
    const { id, user_id, type } = req.body;
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `INSERT INTO Survey (id, user_id, title, type, settings) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id, user_id, "Без названия", type, {}]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Ошибка при создании опроса:", err);
      res.status(500).json({ message: "Ошибка при создании опроса" });
    } finally {
      client.release();
    }
  }

  // Редактирование опроса
  async editSurvey(req, res) {
    const { id } = req.params;
    const { title, description, settings } = req.body;
    const client = await this.db.connect();

    try {
      const query = `
                UPDATE Survey 
                SET 
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    settings = COALESCE($3, settings)
                WHERE id = $4
                RETURNING *;
            `;

      const result = await client.query(query, [
        title,
        description,
        settings,
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Опрос не найден" });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Ошибка при редактировании опроса:", err);
      res.status(500).json({ message: "Ошибка при редактировании опроса" });
    } finally {
      client.release();
    }
  }

  async getSurveysByUserId(req, res) {
    const { id } = req.params;
    const client = await this.db.connect();
    try {
      const result = await client.query(
        `
            SELECT 
                s.id AS survey_id,
                s.title AS survey_title,
                s.description AS survey_description,
                s.type AS survey_type,
                s.settings AS survey_settings
            FROM 
                public.survey s
            JOIN 
                public.person p ON s.user_id = p.id
            WHERE 
                p.id = $1
          `,
        [id] 
      );

      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Ошибка при получении опросов:", err);
      res.status(500).json({ message: "Ошибка при получении опросов" });
    } finally {
      client.release();
    }
  }

  // Получение данных опроса
  async getSurvey(req, res) {
    const { id } = req.params;
    const client = await this.db.connect();

    try {
      const query = `SELECT * FROM Survey WHERE id = $1;`;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Опрос не найден" });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Ошибка при получении данных опроса:", err);
      res.status(500).json({ message: "Ошибка при получении данных опроса" });
    } finally {
      client.release();
    }
  }

  // Создание вопроса
  async createQuestion(req, res) {
    const { surveyId } = req.params;
    const questions = req.body;

    const client = await this.db.connect();
    const savedQuestions = [];

    try {
      for (const question of questions) {
        const {
          id,
          questionText,
          questionType,
          isRequired,
          answerType,
          featureDescription,
          options,
          correctAnswers,
        } = question;

        const questionResult = await client.query(
          `INSERT INTO question (id, survey_id, text, type, required, answer_type, feature_description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            id,
            surveyId,
            questionText,
            questionType,
            isRequired,
            answerType || null,
            featureDescription || null,
          ]
        );

        const savedQuestion = questionResult.rows[0]; 
        console.log("Question saved:", savedQuestion.id);

        if (options && options.length > 0) {
          const savedOptions = [];
          for (let i = 0; i < options.length; i++) {
            const isCorrect = Array.isArray(correctAnswers)
              ? correctAnswers.includes(i)
              : false;
            console.log("isCorrect", correctAnswers, isCorrect);
            const optionResult = await client.query(
              `INSERT INTO answeroption (question_id, text, is_correct) 
               VALUES ($1, $2, $3) RETURNING *`,
              [savedQuestion.id, options[i], isCorrect]
            );
            savedOptions.push(optionResult.rows[0]);
          }
          savedQuestion.options = savedOptions; 
        }

        savedQuestions.push(savedQuestion);
      }

      res.status(201).json(savedQuestions);
    } catch (err) {
      console.error("Ошибка при создании вопроса:", err);
      res.status(500).json({ message: "Ошибка при создании вопроса" });
    } finally {
      client.release();
    }
  }

  // Редактирование опроса
  async editQuestion(req, res) {
    const { questionId } = req.params;
    const {
      questionText,
      questionType,
      isRequired,
      answerType,
      featureDescription,
      options,
      correctAnswers,
    } = req.body;

    const client = await this.db.connect();

    try {
      const query = `
        UPDATE question
        SET 
          text = COALESCE($1, text),
          type = COALESCE($2, type),
          required = COALESCE($3, required),
          answer_type = COALESCE($4, answer_type),
          feature_description = COALESCE($5, feature_description)
        WHERE id = $6
        RETURNING *;
      `;

      const result = await client.query(query, [
        questionText,
        questionType,
        isRequired,
        answerType || null,
        featureDescription || null,
        questionId,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Вопрос не найден" });
      }

      const updatedQuestion = result.rows[0];
      if (options && options.length > 0) {
        await client.query(`DELETE FROM answeroption WHERE question_id = $1`, [
          questionId,
        ]);

        const savedOptions = [];
        for (let i = 0; i < options.length; i++) {
          const isCorrect = Array.isArray(correctAnswers)
            ? correctAnswers.includes(i)
            : false;
          const optionResult = await client.query(
            `INSERT INTO answeroption (question_id, text, is_correct) 
             VALUES ($1, $2, $3) RETURNING *`,
            [questionId, options[i], isCorrect]
          );
          savedOptions.push(optionResult.rows[0]);
        }
        updatedQuestion.options = savedOptions;
      }

      res.status(200).json(updatedQuestion);
    } catch (err) {
      console.error("Ошибка при редактировании вопроса:", err);
      res.status(500).json({ message: "Ошибка при редактировании вопроса" });
    } finally {
      client.release();
    }
  }

  async getQuestionsBySurveyId(req, res) {
    const { surveyId } = req.params;

    const client = await this.db.connect();

    try {
      const questionResult = await client.query(
        `SELECT id, text, type, required, answer_type, feature_description
          FROM question
          WHERE survey_id = $1`,
        [surveyId]
      );
      const questions = questionResult.rows;

      for (const question of questions) {
        const optionResult = await client.query(
          `SELECT id, text, is_correct 
           FROM answeroption 
           WHERE question_id = $1`,
          [question.id]
        );
        question.options = optionResult.rows;
      }

      res.status(200).json(questions);
    } catch (err) {
      console.error("Ошибка при получении вопросов:", err);
      res.status(500).json({ message: "Ошибка при получении вопросов" });
    } finally {
      client.release();
    }
  }
}

module.exports = SurveyController;