const express = require('express');

const router = express.Router();

const bookingController = require('../controller/booking');

router.get('/', bookingController.getAddBooking);
router.post('/', bookingController.add);
router.get('/delete', bookingController.delete);
router.get('/view', bookingController.view);
router.get('/all', bookingController.viewAll);
router.get('/search', bookingController.getSearch);
router.post('/search', bookingController.postSearch);
router.get('/balance', bookingController.getViewBalance);
router.post('/balance', bookingController.postViewBalance);
router.get('/per-period', bookingController.getViewPerPeriod);
router.post('/per-period', bookingController.postViewPerPeriod);
router.get('/pay', bookingController.getPay);
router.post('/pay', bookingController.postPay);

module.exports = router;