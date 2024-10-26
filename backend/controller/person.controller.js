const bcrypt = require('bcrypt');

class PersonController {
    constructor(db) {
        this.db = db;
    }

    async registratePerson(req, res) {
        const { email, password } = req.body;
        const client = await this.db.connect();

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newPerson = await client.query(
                `INSERT INTO Person (email, password) 
                 VALUES ($1, $2) RETURNING id;`,
                [email, hashedPassword]
            );

            res.status(201).json(newPerson.rows[0]);
        } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);

            if (error.code === '23505') {
                res.status(409).json({ error: 'Пользователь с такой электронной почтой уже существует' });
            } else if (error.code === '23503') {
                res.status(400).json({ error: 'Некорректные данные' });
            } else {
                res.status(500).json({ error: 'Не удалось зарегистироваться. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async authorizePerson(req, res) {
        const { email, password } = req.body;
        const client = await this.db.connect();

        try {
            const result = await client.query(
                `SELECT * FROM Person WHERE email = $1;`,
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Неверный логин или пароль' });
            }

            const person = result.rows[0];
            const isMatch = await bcrypt.compare(password, person.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Неверный логин или пароль' });
            }

            res.cookie('user_id', person.id, {
                httpOnly: true,
                maxAge: 28800000
            });

            res.status(201).json({
                id: person.id
            });
        } catch (error) {
            console.error('Ошибка при авторизации пользователя:', error);
            res.status(500).json({ error: 'Не удалось авторизоваться. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async logOutPerson(req, res) {
        res.clearCookie('user_id', { httpOnly: true });

        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ error: 'Не удалось выйти' });
                }
                return res.status(200).json({ message: 'Успешный выход' });
            });
        } else {
            return res.status(200).json({ message: 'Успешный выход' });
        }
    }
}

module.exports = PersonController;