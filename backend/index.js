const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'datacraft_samara',
    password: 'postgres',
    port: 5432,
});

app.use('/api', routes(pool));

app.listen(8080, () => {
    console.log('Server running on port 8080');
});