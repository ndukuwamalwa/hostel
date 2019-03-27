const express = require('express');

const publicController = require('../controller/public');

const router = express.Router();

router.get('/login', publicController.getLogin);
router.post('/login', publicController.postLogin);
router.get('/password-reset', publicController.getReset);
router.post('/password-reset', publicController.postReset);
router.get('/reset-page', publicController.getResetPassword);
router.post('/reset-page', publicController.postResetPassword);
router.get('/logout', publicController.logout);

module.exports = router;