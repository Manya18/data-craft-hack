const bcrypt = require('bcrypt');

class SurveyController {
    constructor(db) {
        this.db = db;
    }

    async createSurvey(req, res) {
        const {id, user_id, type } = req.body;
        const client = await this.db.connect();
        try {
          const result = await client.query(
            `INSERT INTO Survey (id, user_id, title, type, settings) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, user_id, "Без названия", type, {}]
          );
          res.status(201).json(result.rows[0]);
        } catch (err) {
        console.error('Ошибка при создании опроса:', err);
        }
      };
    
      async editSurvey(req, res)  {
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
      
          const result = await client.query(query, [title, description, settings, id]);
      
          if (result.rows.length === 0) {
            return res.status(404).json({ message: "Опрос не найден" });
          }
      
          res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Ошибка при добавлении информации:', err);
        }
      };
}

module.exports = SurveyController;