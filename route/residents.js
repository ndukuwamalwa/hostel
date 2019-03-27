const express = require('express');

const router = express.Router();

const residentsController = require('../controller/residents');

router.get('/', residentsController.getAddResident);
router.post('/', residentsController.add);
router.post('/update', residentsController.update);
router.get('/delete', residentsController.delete);
router.get('/view', residentsController.view);
router.get('/all', residentsController.viewAll);
router.get('/search', residentsController.getSearch);
router.post('/search', residentsController.postSearch);
router.get('/period', residentsController.getViewPerPeriod);
router.get('/per-room', residentsController.getViewPerRoom);
router.get('/per-hostel', residentsController.getViewPerHostel);
router.post('/period', residentsController.postViewPerPeriod);
router.post('/per-room', residentsController.postViewPerRoom);
router.post('/per-hostel', residentsController.postViewPerHostel);
router.get('/update', residentsController.getUpdate);

module.exports = router;