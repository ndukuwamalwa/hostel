const express = require('express');

const router = express.Router();

const hostelController = require('../controller/hostels');

router.get('/', hostelController.getAddHostel);
router.post('/', hostelController.add);
router.post('/rooms', hostelController.postAddRoom);
router.get('/rooms', hostelController.getAddRoom);
router.get('/update', hostelController.getUpdate);
router.post('/update', hostelController.postUpdate);
router.post('/rooms/update', hostelController.postUpdateRoom);
router.get('/rooms/update', hostelController.getUpdateRoom);
router.get('/delete', hostelController.delete);
router.get('/rooms/delete', hostelController.deleteRoom);
router.get('/view', hostelController.view);
router.get('/rooms/view', hostelController.viewRoom);
router.get('/view-rooms', hostelController.viewRooms);
router.get('/all', hostelController.viewAll);
router.get('/rooms/all', hostelController.viewAllRooms);
router.get('/search', hostelController.getSearch);
router.post('/search', hostelController.postSearch);
router.get('/rooms/search', hostelController.getSearchRoom);
router.post('/rooms/search', hostelController.postSearchRoom);

module.exports = router;