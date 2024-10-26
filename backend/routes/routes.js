const express = require('express');
const { processCSVFile, processJSONFile } = require('../controller/controller');
const multer = require('multer');
const router = express.Router();
const upload = multer({dest: 'updloads/'});

module.exports = (pool) => {
    router.post('/uploadCSV/:id', upload.single('file'), (req, res) => {
        processCSVFile(req, res, pool);
    });

    router.post('/uploadJSON/:id', upload.single('file'), (req, res) => {
        processJSONFile(req, res, pool);
    });

    return router;
};
