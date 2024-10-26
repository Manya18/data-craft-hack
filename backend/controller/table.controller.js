class TableController {
    constructor(db) {
        this.db = db;
    }

    async getTables(req, res) {
        const { user_id } = req.query;
        const client = await this.db.connect();
        try {
            const tables = await client.query(
                `select * from tables_list where user_id = $1;`,
                [user_id]
            );
            res.status(201).json(tables.rows);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async updateTableName(req, res) {
        const { old_table_name, new_table_name } = req.body;
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            await client.query(`ALTER TABLE ${old_table_name} RENAME TO ${new_table_name};`);
            await client.query(`UPDATE Tables_list SET table_name=$1 WHERE table_name=$2`, [new_table_name, old_table_name]);

            await client.query('COMMIT');
            res.send('Имя таблицы успешно изменено');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Ошибка при изменении данных', err);

            if (err.code === '42P07') {
                res.status(400).json({ error: `Таблица с именем '${new_table_name}' уже существует.` });
            } else {
                res.status(500).json({ error: 'Не удалось изменить данные. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async removeTable(req, res) {
        const { table_name } = req.query;
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            await client.query(`DROP TABLE "${table_name}"`);
            await client.query(`DELETE FROM Tables_list WHERE table_name=$1`, [table_name]);

            await client.query('COMMIT');
            res.send('Таблица удалена');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Ошибка при удалении данных', err);
            res.status(500).json({ error: 'Не удалось удалить данные. Попробуйте позже' });
        } finally {
            client.release();
        }
    }
}

module.exports = TableController;