const express = require('express');
const router = express.Router();

module.exports = (personController) => {
    router.post('/registrate', (req, res) => {
        personController.registratePerson(req, res);
    });

    router.get('/authorize', (req, res) => {
        personController.authorizePerson(req, res);
    });

    router.get('/logout', (req, res) => {
        personController.logOutPerson(req, res);
    });

    return router;
};