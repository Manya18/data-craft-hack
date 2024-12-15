const express = require('express');
const router = express.Router();

module.exports = (surveyController) => {
    router.post('/surveys', (req, res) => {
        surveyController.createSurvey(req, res);
    });

    router.post('/surveys/:id', (req, res) => {
        surveyController.editSurvey(req, res);
    });

    return router;
};