const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const Pool = require('pg').Pool;
const personRoutes = require('./routes/person.routes');
const PersonController = require('./controller/person.controller');
const surveyRoutes = require('./routes/survey.routes');
const SurveyController = require('./controller/survey.controller');
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'survey-craft',
    password: 'postgres',
    port: 5432
});

const personController = new PersonController(pool);
app.use('/api', personRoutes(personController));

const surveyController = new SurveyController(pool);
app.use('/api', surveyRoutes(surveyController));

app.listen(8080, () => {
    console.log('Server running on port 8080');
});

module.exports = pool;