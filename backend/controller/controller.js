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
    let tableName = '';
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
                try {
                    const keys = Object.keys(results[0]);
                    const keysWithTypes = keys.map(key => `${key} TEXT`);
                    console.log(keysWithTypes)

                    await pool.query(`CREATE TABLE IF NOT EXISTS your_table_2 (${keysWithTypes.join(', ')})`);

                    for (const row of results) {
                        await pool.query(`INSERT INTO your_table_2(${keys.join(', ')}) VALUES(${keys.map(key => `'${row[key]==='' ? null : row[key]}'`).join(', ')})`);
                    }
                    res.send('Data inserted into database');
                } catch (err) {
                    console.error(err);
                    Error.captureStackTrace(err);
                    res.status(500).send('Error inserting data into database');
                }
            });
    }  catch (err) {
        console.error(err);
        Error.captureStackTrace(err);
        res.status(500).send('Error reading file');
    }
}

module.exports = {
    processFile
};
