const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const processFile = async (req, res, pool) => {
    const results = [];

    try {
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Создание таблицы на основе заголовков
                    const keys = Object.keys(results[0]);
                    const keysWithTypes = keys.map(key => `${key} VARCHAR(255)`); // Замените VARCHAR(255) на нужный тип
                    await pool.query(`CREATE TABLE IF NOT EXISTS your_table_2 (${keysWithTypes.join(', ')})`);

                    // Вставка данных в таблицу
                    for (const row of results) {
                        await pool.query(`INSERT INTO your_table_2(${keys.join(', ')}) VALUES(${keys.map(key => `'${row[key]}'`).join(', ')})`);
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
