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
    router.get('/table', (req, res) => {
        tableController.getTableRows(req, res);
    });
    router.get('/columnDistinct', (req, res) => {
        tableController.getDistinct(req, res);
    });
    router.put('/row', (req, res) => {
        tableController.addRow(req, res);
    });
    router.put('/cell', (req, res) => {
        tableController.updateCell(req, res);
    });
    router.delete('/row', (req, res) => {
        tableController.removeRow(req, res);
    });
    router.get('/columns', (req, res) => {
        tableController.getColumnsName(req, res);
    });
    router.post('/uniqcount', (req, res) => {
        tableController.getUniqueCount(req, res);
    });
    return router;
};