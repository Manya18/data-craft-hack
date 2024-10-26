const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const processCSVFile = async (req, res, pool) => {
    const results = [];
    const userId = req.params.id;
    const tableName = getTableName(req.file.originalname, userId)

    console.log(tableName);

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

const getTableName = (fileName, userId) => {
    const tableName = fileName.split('.')[0]
        .replace(/[\s-]+/g, '_')
        .replace(/[^\d\w_]/g, '') + `_${userId}`;
    return tableName;

}

const formatKey = (key) => {
    return key.split(" ").join("_").replace(/[^a-zA-Zа-яА-Я0-9_]/g, '') || null
}

const processJSONFile = async (req, res, pool) => {
    const userId = req.params.id;
    const tableName = getTableName(req.file.originalname, userId)
    const client = await pool.connect();

    try {

        const jsonData = fs.readFileSync(req.file.path, 'utf8');
        const jsonArray = JSON.parse(jsonData);
        if (!Array.isArray(jsonArray)) {
            return res.status(400).send('JSON file must contain an array of objects.');
        }

        const keyMapping = {};
        const keys = Object.keys(jsonArray[0]).map(key => {
            const formattedKey = formatKey(key);
            keyMapping[formattedKey] = key;
            return formattedKey;
        });

        const keysWithTypes = keys.map(key => `${key} TEXT`);

        await client.query('BEGIN');

        await client.query(`CREATE TABLE ${tableName} (${keysWithTypes.join(', ')})`);

        for (const row of jsonArray) {
            await client.query(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES(${keys.map(key => `'${row[keyMapping[key]] === '' ? null : row[keyMapping[key]]}'`).join(', ')})`);
        }
        await client.query(`INSERT INTO Tables_list (user_id, table_name) VALUES ($1, $2)`, [userId, tableName]);
        await client.query('COMMIT');

        res.send('Data inserted into database');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);

        if (err.code === '42P07') {
            res.status(400).send(`Таблица ${tableName} уже существует.`);
        } else {
            res.status(500).send('Error inserting data into database');
        }
    } finally {
        client.release();
    }
}

module.exports = {
    processCSVFile,
    processJSONFile
};
