const express = require('express');

const router = express.Router();

const userController = require('../controller/users');

router.get('/', userController.getAddUser);
router.post('/', userController.postAdd);
router.post('/change-password', userController.changePassword);
router.get('/delete', userController.delete);
router.get('/view', userController.view);
router.get('/all', userController.viewAll);
router.get('/search', userController.getSearch);
router.post('/search', userController.postSearch);

module.exports = router;