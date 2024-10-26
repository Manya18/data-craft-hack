const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

function isNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

const processFile = async (req, res, pool) => {
    const results = [];
    const userId = req.params.id;
    const tableName = req.file.originalname.split('.')[0]
        .replace(/[\s-]+/g, '_')
        .replace(/[^\d\w_]/g, '') + `_${userId}`;

    console.log(tableName);
    let columns = [];

    try {
        fs.createReadStream(req.file.path)
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => {
                const modifiedData = Object.entries(data).reduce((acc, [key, value]) => {
                    const newKey = key.split(" ").join("_").replace(/[,()]/g, '');
                    acc[newKey] = value;
                    return acc;
                }, {});
                results.push(modifiedData);
            })
            .on('end', async () => {
                const client = await pool.connect(); // Дожидаемся получения клиента

                try {
                    const keys = Object.keys(results[0]);
                    const keysWithTypes = keys.map(key => `${key} TEXT`);

                    await client.query('BEGIN');

                    // Попытка создать таблицу
                    await client.query(`CREATE TABLE ${tableName} (${keysWithTypes.join(', ')})`);

                    // Вставляем данные
                    for (const row of results) {
                        await client.query(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES(${keys.map(key => `'${row[key]}'`).join(', ')})`);
                    }

                    // Записываем информацию о созданной таблице
                    await client.query(`INSERT INTO Tables_list (user_id, table_name) VALUES ($1, $2)`, [userId, tableName]);

                    await client.query('COMMIT');

                    res.send('Data inserted into database');
                } catch (err) {
                    await client.query('ROLLBACK'); // Откат транзакции в случае ошибки
                    console.error(err);

                    if (err.code === '42P07') {
                        res.status(400).send(`Таблица ${tableName} уже существует.`);
                    } else {
                        res.status(500).send('Error inserting data into database');
                    }
                } finally {
                    client.release(); // Освобождаем клиента обратно в пул
                }
            });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading file');
    }
}

module.exports = {
    processFile
};
