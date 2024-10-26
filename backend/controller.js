const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const processFile = async (req, res, pool) => {
    const results = [];
    let tableName = '';
    let columns = [];

    try {
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                if (results.length === 0) {
                    // Первая строка - название таблицы
                    tableName = data[Object.keys(data)[0]]; // Предполагаем, что название таблицы в первом столбце
                } else if (results.length === 1) {
                    // Вторая строка - названия столбцов
                    columns = Object.keys(data);
                } else {
                    // Остальные строки - данные
                    results.push(data);
                }
            })
            .on('end', async () => {
                try {
                    console.log(tableName);
                    console.log(results);
                    // Создание таблицы на основе заголовков
                    const keysWithTypes = columns.map(key => `${key} TEXT`); // Замените TEXT на нужный тип
                    await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${keysWithTypes.join(', ')})`);

                    // Вставка данных в таблицу
                    for (const row of results) {
                        await pool.query(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES(${columns.map(key => `'${row[key]}'`).join(', ')})`);
                    }
                    res.send('Data inserted into database');
                } catch (err) {
                    console.error(err);
                    Error.captureStackTrace(err);
                    res.status(500).send('Error inserting data into database');
                }
            });
    } catch (err) {
        console.error(err);
        Error.captureStackTrace(err);
        res.status(500).send('Error reading file');
    }
}

module.exports = {
    processFile
};
