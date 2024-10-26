const express = require('express');
const router = express.Router();

module.exports = (tableController) => {
    router.get('/tables', (req, res) => {
        tableController.getTables(req, res);
    });
    router.put('/table', (req, res) => {
        tableController.updateTableName(req, res);
    });
    router.delete('/table', (req, res) => {
        tableController.removeTable(req, res);
    });
    return router;
};