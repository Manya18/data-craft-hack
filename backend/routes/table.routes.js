const express = require('express');
const router = express.Router();

module.exports = (tableController) => {
    router.get('/tables', (req, res) => {
        tableController.getTables(req, res);
    });
    return router;
};