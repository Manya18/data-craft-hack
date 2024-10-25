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
    router.put('/column', (req, res) => {
        tableController.addColumn(req, res);
    });
    router.delete('/column', (req, res) => {
        tableController.removeColumn(req, res);
    });
    router.put('/type', (req, res) => {
        tableController.updateColumnType(req, res);
    });
    return router;
};