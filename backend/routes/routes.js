const express = require('express');
const { processFile } = require('../controller/controller');
const multer = require('multer');
const router = express.Router();
const upload = multer({dest: 'updloads/'});



module.exports = (pool) => {
    router.post('/upload', upload.single('file'), (req, res) => {
        processFile(req, res, pool);
    });
    return router;
};
