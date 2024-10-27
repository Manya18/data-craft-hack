const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const Pool = require('pg').Pool;
const routes = require('./routes/routes');
const personRoutes = require('./routes/person.routes');
const tableRoutes = require('./routes/table.routes');
const PersonController = require('./controller/person.controller');
const TableController = require('./controller/table.controller');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'datacraft_samara',
    password: 'postgres',
    port: 5432
});

const personController = new PersonController(pool);
const tableController = new TableController(pool);

app.use('/api', routes(pool));
app.use('/api', personRoutes(personController));
app.use('/api', tableRoutes(tableController));

app.listen(8080, () => {
    console.log('Server running on port 8080');
});

module.exports = pool;