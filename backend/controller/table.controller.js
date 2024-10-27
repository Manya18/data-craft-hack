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

    async getDistinct(req, res) {
        const { column, table } = req.query;
        const client = await this.db.connect();
        try {
            const result = await client.query(
                `SELECT DISTINCT ${column} FROM ${table};`
            );
            const valuesArray = result.rows.map(row => row[column]);

            res.status(200).json(valuesArray);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async getTableRows(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const table = req.query.table;

        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

        const filterParams = req.query.filters ? JSON.parse(req.query.filters) : [];

        try {
            let query = `SELECT * FROM ${table}`;
            const params = [];
            let filterConditions = [];

            if (filterParams.length > 0) {
                filterConditions = filterParams.map((filter, index) => {
                    params.push(filter.value);
                    return `${filter.column} = $${params.length}`;
                });
                query += ` WHERE ${filterConditions.join(' AND ')}`;
            }

            query += ` ORDER BY ${sortBy} ${sortOrder}`;

            query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const result = await this.db.query(query, params);

            let totalCountQuery = `SELECT COUNT(*) FROM ${table}`;
            if (filterParams.length > 0) {
                const totalFilterConditions = filterParams.map((filter, index) => {
                    return `${filter.column} = $${index + 1}`;
                });
                totalCountQuery += ` WHERE ${totalFilterConditions.join(' AND ')}`;
            }

            const totalCountResult = await this.db.query(totalCountQuery, params.slice(0, filterParams.length));
            const totalCount = parseInt(totalCountResult.rows[0].count);

            res.json({
                data: result.rows,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            });
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            res.status(500).send('Ошибка сервера');
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
        const { table_name } = req.body;
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

    async addColumn(req, res) {
        const { table_name, column_name, column_type } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} ADD COLUMN ${column_name} ${column_type}`);
            res.send(`Колонка ${column_name} успешно добавлена в таблицу ${table_name}`);
        } catch (err) {
            console.error('Ошибка при добавлении колонки', err);
            res.status(500).json({ error: 'Не удалось добавить колонку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async removeColumn(req, res) {
        const { table_name, column_name } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} DROP COLUMN ${column_name}`);
            res.send(`Колонка ${column_name} успешно удалена из таблицы ${table_name}`);
        } catch (err) {
            console.error('Ошибка при удалении колонки', err);
            res.status(500).json({ error: 'Не удалось удалить колонку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async updateColumnType(req, res) {
        const { table_name, column_name, new_column_type } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} ALTER COLUMN ${column_name} SET DATA TYPE ${new_column_type} USING ${column_name}::${new_column_type};`);
            res.send(`Тип данных успешно изменен`);
        } catch (err) {
            console.error('Ошибка при изменений типа данных', err);
            if (err.code === '42P01') {
                res.status(404).json({ error: 'Таблица не найдена.' });
            } else if (err.code === '42703') {
                res.status(404).json({ error: 'Колонка не найдена.' });
            }
            else if (err.code === '42804') {
                res.status(400).json({ error: `Не удалось изменить тип данных: несовместимый тип для преобразования ${column_name} в ${new_column_type}.` });
            } else {
                res.status(500).json({ error: 'Не удалось изменить тип данных. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async addRow(req, res) {
        const { table_name } = req.body;
        const client = await this.db.connect();

        try {
            const newRow = await client.query(`INSERT INTO ${table_name} DEFAULT VALUES RETURNING id;`);
            res.send(`Новая строка ${newRow.rows[0].id}`);
        } catch (err) {
            console.error('Ошибка при добавлении строки', err);
            res.status(500).json({ error: 'Не удалось добавить строку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async updateCell(req, res) {
        const { changes, table_name } = req.body;
        const client = await this.db.connect();
        console.log(changes)
        try {
            for (const [key, change] of Object.entries(changes)) {
                const { column, newValue } = change;
                console.log(table_name)
                const rowId = key.split('-')[0];
                await client.query(`UPDATE ${table_name} SET ${column} = $1 WHERE id = $2`, [newValue, rowId]);
            }
        } catch (err) {
            console.error('Ошибка при обновлении ячейки', err);
            if (err.code === '42P01') {
                res.status(404).json({ error: 'Таблица не найдена.' });
            } else if (err.code === '42703') {
                res.status(404).json({ error: 'Колонка не найдена.' });
            } else {
                res.status(500).json({ error: 'Не удалось обновить ячейку. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async removeRow(req, res) {
        const { table_name, row_id } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`DELETE FROM ${table_name} WHERE id=$1`, [row_id]);
            res.send(`Строка удалена`);
        } catch (err) {
            console.error('Ошибка при удалении строки ячейки', err);
            res.status(500).json({ error: 'Не удалось удалить строку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async getColumnsName(req, res) {
        const { table_name } = req.body;
        const client = await this.db.connect();

        try {
            const result = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = $1;`, [table_name]);

            if (result.rows.length > 0) {
                const columns = result.rows.map(row => row.column_name);
                res.status(200).json(columns);
            } else {
                res.status(404).json({ message: 'Таблица не найдена' });
            }
        } catch (err) {
            console.error('Ошибка при получении столбцов', err);
            res.status(500).json({ error: 'Не удалось найти столбцы. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    // async getColumnsType(req, res) {
    //     const {table_name} = req.body;
    //     const client = await this.db.connect();

    //     try {
    //         const columnsTypes = client.query(`SELECT Пространство, COUNT(*) AS columns
    //         FROM _11samara_tasks__1
    //         GROUP BY Пространство
    //         ORDER BY columns DESC;`)
    //     }
    // }

    async getUniqueCount(req, res) {
        const { table_name, count, condition_column, condition_value } = req.body;
        const client = await this.db.connect();

        try {
            const query = `
                SELECT ${count}, COUNT(*) AS uniq_count
                FROM ${table_name}
                WHERE ${condition_column} = $1
                GROUP BY ${count}
                ORDER BY uniq_count DESC;
            `;

            const columns = await client.query(query, [condition_value]);

            const uniqueValues = columns.rows.map(row => row[count]);
            const counts = columns.rows.map(row => row.uniq_count);

            res.status(200).json({ uniqueValues, counts });
        } catch (err) {
            console.error('Ошибка при получении столбцов', err);
            res.status(500).json({ error: 'Не удалось найти столбцы. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

}

module.exports = TableController;